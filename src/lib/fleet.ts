export type HealthStatus = "HEALTHY" | "DEGRADED" | "CRITICAL";

export type FailureClass =
  | "NONE"
  | "THERMAL_THROTTLE"
  | "POWER_SPIKE"
  | "ECC_BURST"
  | "NIC_FLAP"
  | "BOOT_LOOP";

export type EventSeverity = "INFO" | "WARN" | "CRIT";

export type FleetEvent = {
  ts: number;
  severity: EventSeverity;
  title: string;
  detail: string;
};

export type FleetNode = {
  node_id: string;
  rack: string;
  zone: string;

  cpu_temp_c: number;
  power_w: number;
  fan_rpm: number;

  throttle_events: number;
  ecc_errors: number;
  nic_errors: number;
  reboot_count: number;

  last_seen: number;
  status: HealthStatus;
  failure_class: FailureClass;
  health_score: number;
};

export type FleetSnapshot = {
  generated_at: number;
  nodes: FleetNode[];
  events: FleetEvent[];
};

export type ValidationCheck = {
  name: string;
  pass: boolean;
  detail: string;
};

export type ValidationRun = {
  run_id: string;
  started_at: number;
  finished_at: number;
  checks: ValidationCheck[];
  summary: {
    overall_pass: boolean;
    pass_count: number;
    fail_count: number;
  };
};

const ZONES = ["iad1-a", "iad1-b", "iad1-c", "pdx1-a", "pdx1-b", "sin1-a"] as const;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function rint(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: readonly T[]): T {
  return arr[rint(0, arr.length - 1)];
}
function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function now() {
  return Date.now();
}

function computeHealth(n: Omit<FleetNode, "status" | "health_score">): { status: HealthStatus; score: number } {
  // Higher is better (0..100)
  // Penalize thermal/power tails, errors, reboots, throttles.
  const tempPenalty = Math.max(0, n.cpu_temp_c - 65) * 1.2; // >65C starts penalty
  const powerPenalty = Math.max(0, n.power_w - 260) * 0.08; // >260W starts penalty
  const fanPenalty = Math.max(0, (2600 - n.fan_rpm)) * 0.01; // low fan rpm is bad
  const eccPenalty = n.ecc_errors * 6;
  const nicPenalty = n.nic_errors * 3;
  const rebootPenalty = n.reboot_count * 8;
  const throttlePenalty = n.throttle_events * 5;

  const raw = 100 - (tempPenalty + powerPenalty + fanPenalty + eccPenalty + nicPenalty + rebootPenalty + throttlePenalty);
  const score = Math.round(clamp(raw, 0, 100));

  let status: HealthStatus = "HEALTHY";
  if (score < 70) status = "DEGRADED";
  if (score < 45) status = "CRITICAL";

  // Escalate if certain signals are extreme
  if (n.cpu_temp_c >= 92 || n.power_w >= 520 || n.reboot_count >= 3 || n.ecc_errors >= 6) status = "CRITICAL";
  else if (n.cpu_temp_c >= 85 || n.power_w >= 420 || n.nic_errors >= 6 || n.throttle_events >= 4) status = "DEGRADED";

  return { status, score };
}

function inferFailureClass(n: Omit<FleetNode, "failure_class" | "status" | "health_score">): FailureClass {
  if (n.reboot_count >= 3) return "BOOT_LOOP";
  if (n.ecc_errors >= 6) return "ECC_BURST";
  if (n.nic_errors >= 6) return "NIC_FLAP";
  if (n.cpu_temp_c >= 88 || n.throttle_events >= 4) return "THERMAL_THROTTLE";
  if (n.power_w >= 420) return "POWER_SPIKE";
  return "NONE";
}

function makeNode(i: number): FleetNode {
  const zone = pick(ZONES);
  const rack = `R${pad2(rint(1, 40))}`;
  const node_id = `node-${pad2(Math.floor(i / 100))}-${pad2(i % 100)}-${rint(100, 999)}`;

  const baseTemp = rand(45, 72);
  const basePower = rand(180, 320);
  const fan = rand(2400, 5200);

  const throttle = Math.random() < 0.06 ? rint(1, 6) : 0;
  const ecc = Math.random() < 0.03 ? rint(1, 9) : 0;
  const nic = Math.random() < 0.05 ? rint(1, 10) : 0;
  const reboot = Math.random() < 0.02 ? rint(1, 4) : 0;

  const partial: Omit<FleetNode, "failure_class" | "status" | "health_score"> = {
    node_id,
    rack,
    zone,
    cpu_temp_c: clamp(baseTemp + throttle * rand(2, 4), 30, 105),
    power_w: clamp(basePower + (Math.random() < 0.08 ? rand(80, 220) : 0), 120, 650),
    fan_rpm: clamp(fan - throttle * rand(100, 250), 1200, 9000),
    throttle_events: throttle,
    ecc_errors: ecc,
    nic_errors: nic,
    reboot_count: reboot,
    last_seen: now() - rint(0, 15) * 60_000,
  };

  const failure_class = inferFailureClass(partial);
  const { status, score } = computeHealth({ ...partial, failure_class });

  return {
    ...partial,
    failure_class,
    status,
    health_score: score,
  };
}

function driftNode(prev: FleetNode): FleetNode {
  // small drift + occasional spikes
  const spikeThermal = Math.random() < 0.03;
  const spikePower = Math.random() < 0.03;
  const nicBurst = Math.random() < 0.02;
  const eccBurst = Math.random() < 0.01;
  const reboot = Math.random() < 0.01;

  const cpu_temp_c = clamp(
    prev.cpu_temp_c + rand(-2.0, 2.5) + (spikeThermal ? rand(10, 22) : 0),
    30,
    105
  );
  const power_w = clamp(prev.power_w + rand(-15, 18) + (spikePower ? rand(90, 220) : 0), 120, 650);
  const fan_rpm = clamp(prev.fan_rpm + rand(-250, 250), 1200, 9000);

  const throttle_events = clamp(
    prev.throttle_events + (cpu_temp_c >= 88 ? rint(0, 2) : rint(0, 1)) + (spikeThermal ? rint(1, 3) : 0),
    0,
    12
  );
  const nic_errors = clamp(prev.nic_errors + (nicBurst ? rint(3, 10) : rint(0, 1)), 0, 50);
  const ecc_errors = clamp(prev.ecc_errors + (eccBurst ? rint(4, 10) : rint(0, 1)), 0, 50);
  const reboot_count = clamp(prev.reboot_count + (reboot ? 1 : 0), 0, 10);

  const partial: Omit<FleetNode, "failure_class" | "status" | "health_score"> = {
    ...prev,
    cpu_temp_c,
    power_w,
    fan_rpm,
    throttle_events,
    nic_errors,
    ecc_errors,
    reboot_count,
    last_seen: now() - rint(0, 8) * 60_000,
  };

  const failure_class = inferFailureClass(partial);
  const { status, score } = computeHealth({ ...partial, failure_class });

  return { ...partial, failure_class, status, health_score: score };
}

export function generateFleetSnapshot(size: number, prev?: FleetSnapshot): FleetSnapshot {
  const generated_at = now();

  if (!prev) {
    return {
      generated_at,
      nodes: Array.from({ length: size }, (_, i) => makeNode(i)),
      events: [
        {
          ts: generated_at,
          severity: "INFO",
          title: "Snapshot generated",
          detail: `Initialized fleet telemetry for ${size} nodes.`,
        },
      ],
    };
  }

  // mutate a subset of nodes to simulate a new interval
  const nextNodes = prev.nodes.map((n) => (Math.random() < 0.35 ? driftNode(n) : n));
  return {
    generated_at,
    nodes: nextNodes,
    events: prev.events,
  };
}

export function diffToEvents(prev: FleetSnapshot, next: FleetSnapshot): FleetEvent[] {
  const byIdPrev = new Map(prev.nodes.map((n) => [n.node_id, n]));
  const events: FleetEvent[] = [];

  // create up to 40 events, later caller slices to 20
  for (const n of next.nodes) {
    const p = byIdPrev.get(n.node_id);
    if (!p) continue;

    if (p.status !== n.status) {
      const sev: EventSeverity = n.status === "CRITICAL" ? "CRIT" : n.status === "DEGRADED" ? "WARN" : "INFO";
      events.push({
        ts: next.generated_at,
        severity: sev,
        title: "Health state changed",
        detail: `${n.node_id} ${p.status} → ${n.status} • ${n.failure_class} • temp=${n.cpu_temp_c.toFixed(
          1
        )}°C power=${n.power_w.toFixed(0)}W`,
      });
    } else if (p.failure_class !== n.failure_class) {
      const sev: EventSeverity = n.failure_class === "NONE" ? "INFO" : "WARN";
      events.push({
        ts: next.generated_at,
        severity: sev,
        title: "Failure class updated",
        detail: `${n.node_id} ${p.failure_class} → ${n.failure_class} • score=${n.health_score}`,
      });
    }
    if (events.length >= 40) break;
  }

  if (events.length === 0) {
    events.push({
      ts: next.generated_at,
      severity: "INFO",
      title: "Telemetry refreshed",
      detail: "No significant state transitions detected in this interval.",
    });
  }

  return events;
}

export function runValidationSuite(snapshot: FleetSnapshot): ValidationRun {
  const started_at = now();
  const run_id = `run-${started_at.toString(16)}-${rint(1000, 9999)}`;
  const nodes = snapshot.nodes;

  const critical = nodes.filter((n) => n.status === "CRITICAL");
  const degraded = nodes.filter((n) => n.status === "DEGRADED");

  const thermalBad = nodes.filter((n) => n.cpu_temp_c >= 90 || n.throttle_events >= 5).length;
  const powerBad = nodes.filter((n) => n.power_w >= 450).length;
  const eccBad = nodes.filter((n) => n.ecc_errors >= 6).length;
  const nicBad = nodes.filter((n) => n.nic_errors >= 8).length;
  const rebootBad = nodes.filter((n) => n.reboot_count >= 3).length;

  const checks: ValidationCheck[] = [
    {
      name: "Thermal headroom",
      pass: thermalBad <= Math.max(5, Math.floor(nodes.length * 0.01)),
      detail: `nodes_over_limit=${thermalBad} (temp>=90C OR throttle>=5)`,
    },
    {
      name: "Power delivery stability",
      pass: powerBad <= Math.max(6, Math.floor(nodes.length * 0.012)),
      detail: `nodes_with_power_spike=${powerBad} (power>=450W)`,
    },
    {
      name: "ECC stability (DIMM health)",
      pass: eccBad <= Math.max(3, Math.floor(nodes.length * 0.006)),
      detail: `nodes_with_ecc_burst=${eccBad} (ecc>=6)`,
    },
    {
      name: "NIC error burst / link flaps",
      pass: nicBad <= Math.max(6, Math.floor(nodes.length * 0.012)),
      detail: `nodes_with_nic_flap=${nicBad} (nic>=8)`,
    },
    {
      name: "Reboot loop detection",
      pass: rebootBad <= Math.max(2, Math.floor(nodes.length * 0.004)),
      detail: `nodes_in_boot_loop=${rebootBad} (reboots>=3)`,
    },
    {
      name: "Fleet health gate",
      pass: critical.length <= Math.max(8, Math.floor(nodes.length * 0.015)),
      detail: `critical=${critical.length} degraded=${degraded.length}`,
    },
  ];

  const pass_count = checks.filter((c) => c.pass).length;
  const fail_count = checks.length - pass_count;

  const finished_at = now();
  return {
    run_id,
    started_at,
    finished_at,
    checks,
    summary: {
      overall_pass: fail_count === 0,
      pass_count,
      fail_count,
    },
  };
}
