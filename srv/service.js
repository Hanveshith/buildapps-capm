const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

  const { LeaveRequest, Employee } = this.entities;

  this.on('getCurrentUser', async (req) => {
    const userEmail = req.user.email || req.user.id;
    console.log(req.user)
    const employee = await SELECT.one.from(Employee)
      .where({ Email: userEmail });

    if (!employee)
      req.error(404, 'Employee not found for logged-in user');

    return {
      EmployeeName: employee.EmployeeName,
      Email: employee.Email,
      Department: employee.Department,
      Designation: employee.Designation
    };
  });

  this.before('CREATE', LeaveRequest, async (req) => {

    const {
      LeaveType,
      Reason,
      StartDate,
      EndDate,
      TotalDays = 0
    } = req.data;

    if (!LeaveType)
      req.error(400, 'Leave Type is mandatory');

    if (!Reason)
      req.error(400, 'Reason is mandatory');

    if (!StartDate || !EndDate)
      req.error(400, 'Start Date and End Date are mandatory');

    if (StartDate > EndDate)
      req.error(400, 'Start Date cannot be after End Date');

    if (!TotalDays || TotalDays <= 0)
      req.error(400, 'TotalDays must be greater than zero');

    const userEmail = req.user.email || req.user.id;

    const employee = await SELECT.one.from(Employee)
      .where({ Email: userEmail });

    if (!employee)
      req.error(404, 'Employee not found for logged-in user');

    if (!employee.ManagerID)
      req.error(400, 'Manager not assigned to employee');

    req.data.Employee_EmployeeID = employee.EmployeeID;
    req.data.Manager_EmployeeID = employee.ManagerID;
    req.data.Status = 'Submitted';
    req.data.ManagerStatus = 'Pending';
    req.data.HRStatus = 'Pending';
    req.data.SubmittedAt = new Date();
  });

  this.on('managerApprove', LeaveRequest, async (req) => {
    const { LeaveID } = req.params[0];

    const leave = await SELECT.one.from(LeaveRequest).where({ LeaveID });

    if (!leave)
      req.error(404, 'Leave not found');

    if (leave.Status !== 'Submitted')
      req.error(400, 'Leave must be submitted before manager approval');

    if (leave.ManagerStatus !== 'Pending')
      req.error(400, 'Manager has already acted');

    await UPDATE(LeaveRequest)
      .set({
        ManagerStatus: 'Approved',
        Status: 'ManagerApproved',
        ManagerApprovedAt: new Date()
      })
      .where({ LeaveID });

    return 'Manager approved the leave';
  });

  this.on('hrApprove', LeaveRequest, async (req) => {
    const { LeaveID } = req.params[0];

    const leave = await SELECT.one.from(LeaveRequest).where({ LeaveID });

    if (!leave)
      req.error(404, 'Leave not found');

    if (leave.Status !== 'ManagerApproved')
      req.error(400, 'Manager approval required before HR approval');

    if (leave.HRStatus !== 'Pending')
      req.error(400, 'HR has already acted');

    await UPDATE(LeaveRequest)
      .set({
        HRStatus: 'Approved',
        Status: 'Approved',
        HRApprovedAt: new Date()
      })
      .where({ LeaveID });

    return 'HR approved the leave';
  });

  this.on('reject', LeaveRequest, async (req) => {
    const { LeaveID } = req.params[0];
    const { reason } = req.data;

    if (!reason)
      req.error(400, 'Rejection reason is mandatory');

    const leave = await SELECT.one.from(LeaveRequest).where({ LeaveID });

    if (!leave)
      req.error(404, 'Leave not found');

    if (leave.Status === 'Approved')
      req.error(400, 'Approved leave cannot be rejected');

    await UPDATE(LeaveRequest)
      .set({
        Status: 'Rejected',
        RejectedAt: new Date(),
        RejectionReason: reason
      })
      .where({ LeaveID });

    return 'Leave rejected';
  });

});
