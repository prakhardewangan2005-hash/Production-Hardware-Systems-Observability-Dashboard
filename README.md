# Production Hardware Validation & Fleet Triage Console

**Live Demo:** https://production-hardware-systems-observa-xi.vercel.app  
**Domain:** Hardware Systems Engineering • Fleet Validation • Power/Thermal Telemetry • Failure Triage  
**Build:** React + TypeScript + Vite (Pure CSS) • **Deploy:** Vercel • **Mode:** In-browser simulation (no backend)

---

## Why this exists (Meta Hardware Intern-aligned)

This project simulates the **kind of internal tooling used to validate hardware + triage fleet issues** at hyperscale:
- Fleet-level observability for **power / thermal / reliability** signals
- Rapid identification of **critical nodes** and dominant **failure classes**
- A “Validation Suite” that produces a **run_id** and a **pass/fail gate** (exportable report)
- Lightweight, production-style UX designed for **operators + hardware/system engineers**

---

## What the console does

### ✅ Fleet Simulator (1000 nodes)
Each node includes realistic server telemetry fields:

`node_id, rack, zone, cpu_temp_c, power_w, fan_rpm, throttle_events, ecc_errors, nic_errors, reboot_count, last_seen, status, failure_class, health_score`

Telemetry generation simulates:
- Thermal spikes + throttling
- Power tail events
- ECC bursts (memory health)
- NIC link flaps
- Boot-loop style instability

---

## Key Features (production-style)

### 📊 KPI Cards (fleet health at a glance)
- **Fleet Size**
- **Critical Nodes**
- **P95 CPU Temp**
- **P95 Power**

### 🧪 Run Validation Suite (gating)
One click produces:
- `run_id`
- Check-level results (pass/fail)
- Overall fleet gate: **PASS / FAIL**
- Adds an entry to the **event timeline**

### 🔁 Regenerate Telemetry
Refreshes fleet data and logs the latest changes as events.

### 📥 Exporters (operator-ready)
- **Download CSV** (filtered/sorted rows)
- **Download Validation Report (Markdown)** for reviews / handoffs / documentation

### 🧾 Fleet Table (triage-first)
- Sortable columns
- Search by `node_id / rack / zone`
- Filter by **status** and **failure_class**
- Designed for fast fleet scanning and investigation

### 🕒 Event Timeline
Shows the last 20 significant fleet transitions and validation runs:
- Health state changes (HEALTHY → DEGRADED → CRITICAL)
- Failure class changes
- Validation suite PASS/FAIL events

---

## Failure Classes Modeled
- `THERMAL_THROTTLE` (thermal risk / throttling)
- `POWER_SPIKE` (power delivery tail behavior)
- `ECC_BURST` (DIMM reliability risk)
- `NIC_FLAP` (network interface instability)
- `BOOT_LOOP` (reboot instability)
- `NONE`

---

## Tech Stack
- **Frontend:** React + TypeScript
- **Build:** Vite
- **UI:** Pure CSS (no component libraries)
- **Deploy:** Vercel  
- **Data:** Synthetic in-browser simulation (no env vars, no backend)

---

## How to run locally (optional)
```bash
npm install
npm run dev
