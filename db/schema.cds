namespace leavemanagement.db;

using { managed } from '@sap/cds/common';

entity Employee : managed {
  key EmployeeID : UUID @title : 'Employee ID';
  EmployeeName  : String(100) @title : 'Employee Name';
  Email         : String(100) @title : 'Email';
  Department    : String(50)  @title : 'Department';
  Designation   : String(50)  @title : 'Designation';
  ManagerID     : UUID        @title : 'Manager ID';
}

entity LeaveRequest : managed {
  key LeaveID : UUID;

  Employee       : Association to Employee @title : 'Employee';

  Manager        : Association to Employee @title : 'Manager Approver';
  HR             : Association to Employee @title : 'HR Approver';

  LeaveType      : String(30)   @title : 'Leave Type';
  StartDate      : Timestamp         @title : 'Start Date';
  EndDate        : Timestamp         @title : 'End Date';
  TotalDays      : Decimal(3,1) @title : 'Total Days';

  Reason         : String(255)  @title : 'Reason';

  Status         : String(30) default 'Draft' @title : 'Overall Status';

  ManagerStatus  : String(20) default 'Pending' @title : 'Manager Approval Status';
  HRStatus       : String(20) default 'Pending' @title : 'HR Approval Status';

  SubmittedAt    : Timestamp @title : 'Submitted At';

  ManagerApprovedAt : Timestamp @title : 'Manager Approved At';
  HRApprovedAt      : Timestamp @title : 'HR Approved At';

  RejectedAt     : Timestamp @title : 'Rejected At';
  RejectionReason : String(255) @title : 'Reason For Rejection';
}
