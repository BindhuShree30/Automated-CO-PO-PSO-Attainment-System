/**
 * ---------------------------------------------------------
 * Application Roles
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Current single-department implementation:
 * HOD      → Department Administrator
 * FACULTY  → Teaching/Academic User
 *
 * Students do not have login accounts.
 * There is no ADMIN login in the current architecture.
 * ---------------------------------------------------------
 */

const ROLES = Object.freeze({
  HOD: "HOD",
  FACULTY: "FACULTY",
});

export default ROLES;