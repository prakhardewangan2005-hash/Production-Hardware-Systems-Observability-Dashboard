# Production Hardware Systems Observability Dashboard

**Live Demo:** https://production-hardware-systems-observability.vercel.app  
**Tech Stack:** React, TypeScript, Vite, Vercel  
**Domain:** Hardware Systems Engineering • Production Infrastructure • Data Center Observability

---

## Overview

This project is designed as a **production-style internal engineering tool** aligned with the **Meta Hardware Systems Engineer Intern** role. It demonstrates how large-scale server and hardware infrastructure can be monitored, validated, and analyzed through system-level telemetry and observability workflows similar to those used across hyperscale data centers.

Meta’s servers and data centers form the foundation of its rapidly scaling infrastructure. This dashboard reflects how infrastructure teams build internal tools to ensure hardware reliability, performance efficiency, and early failure detection across large server fleets.

---

## Objective

The core objective of this project is to simulate how Meta’s infrastructure teams:

- Develop and maintain hardware validation and observability tools  
- Analyze fleet-wide system behavior at scale  
- Diagnose hardware and system failures using telemetry data  
- Communicate system health clearly to cross-functional stakeholders  

The dashboard represents an **internal-facing system**, not a consumer application, with emphasis on hardware-relevant signals and production reasoning.

---

## Hardware Fleet Simulation

The application simulates a fleet of **production hardware systems operating inside a data center environment**. Each system exposes metrics commonly used by hardware and systems engineers, including:

- CPU utilization (%)
- Memory utilization (%)
- Request latency (ms)
- Error rate (%)
- Throughput (requests per second)
- Aggregated system health state

All telemetry is generated in-browser to emulate real monitoring data collected from thousands of servers across distributed infrastructure.

---

## Fleet-Level Observability

The dashboard provides **fleet-level visibility** using production-oriented KPIs such as:

- Total systems monitored
- Healthy vs degraded vs critical system distribution
- P95 latency (hardware-relevant performance metric)
- Average error rate across the fleet

These indicators mirror how infrastructure teams reason about performance regressions, capacity stress, and early hardware degradation signals.

---

## System Inspection & Analysis

An interactive system table allows engineers to:

- Sort systems by latency and error rate
- Filter systems by health state
- Rapidly isolate degraded or failing hardware

This reflects real-world workflows where engineers must quickly identify problematic machines within large server populations and prioritize investigation.

---

## Validation & Re-Analysis Workflow

The dashboard includes a **re-analysis control** that regenerates fleet telemetry, simulating new monitoring intervals similar to:

- Periodic hardware health checks  
- Validation runs during server bring-up  
- Lifecycle testing and production monitoring cycles  

This aligns with how hardware validation and system testing are repeatedly executed throughout the product lifecycle.

---

## Architecture & Design Rationale

The project is intentionally **frontend-only** to mirror internal validation and design-review tools where the focus is on:

- Hardware and system behavior
- Telemetry interpretation
- Observability logic

Telemetry simulation, metric aggregation, and health classification are all performed within the application, emphasizing **system reasoning over backend complexity**.

---

## Health Classification Logic

System health is derived from combined system-level signals such as latency, error rate, and throughput behavior:

- **Healthy:** Low latency and low error rate  
- **Degraded:** Moderate latency or rising error indicators  
- **Critical:** High latency, high error rate, or throughput collapse  

This reflects how hardware failures often surface indirectly through performance and reliability metrics rather than explicit fault flags.

---

## Alignment with Hardware Systems Engineer Intern Role

This project directly maps to the responsibilities of a Hardware Systems Engineer Intern by demonstrating:

- Development of hardware validation and observability tools  
- Analysis of large-scale server fleet data  
- Diagnosis of hardware and system-level failures  
- Clear communication of findings through internal dashboards  
- Cross-functional systems thinking across hardware, power, thermal, and software layers  

---

## Skills Demonstrated

- Hardware systems observability concepts  
- Production infrastructure reasoning  
- Fleet-scale data modeling and aggregation  
- Internal tooling design for data centers  
- Clear communication of system health and reliability  

---

## Deployment

The dashboard is deployed using a standard **Vite production build pipeline** on **Vercel**:

- Build command: `npm run build`
- Output directory: `dist`
- No environment variables
- No backend services or local dependencies

This ensures a clean, reproducible production deployment suitable for demonstration and review.

---

## Why This Project Is Distinct

This is not a generic dashboard or tutorial project. It is purpose-built to reflect how **hardware systems engineers design tools to validate, monitor, and reason about production infrastructure at scale**. The focus is on observability, reliability, and data-driven diagnosis rather than UI complexity or buzzword-driven features.

---

## Summary

This project demonstrates a strong understanding of **hardware systems validation, production infrastructure monitoring, fleet-scale analysis, and internal tooling design**, closely mirroring the real-world responsibilities and expectations of a **Hardware Systems Engineer Intern** working on large-scale data center infrastructure at Meta.
