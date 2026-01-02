using { leavemanagement.db as db } from '../db/schema';

service LeaveManagementService {

  @restrict: [
    { grant: 'READ', to: 'Employee' }
  ]
  entity Employee as projection on db.Employee;

  @restrict: [
    { grant: ['READ', 'WRITE'], to: 'Employee' },
    { grant: ['READ','WRITE'], to: ['Manager', 'HR'] }
  ]
  entity LeaveRequest as projection on db.LeaveRequest {
    *}
    actions {

      @restrict: [
        { grant: 'EXECUTE', to: 'Manager' }
      ]
      action managerApprove() returns String;

      @restrict: [
        { grant: 'EXECUTE', to: 'HR' }
      ]
      action hrApprove() returns String;

      @restrict: [
        { grant: 'EXECUTE', to: ['Manager', 'HR'] }
      ]
      action reject(reason : String) returns String;
    };

    @restrict: [
    { grant: ['READ'], to: 'Employee' },
    { grant: ['READ'], to: ['Manager', 'HR'] }
  ]
  function getCurrentUser() returns {
    userId      : String;
    email       : String;
    displayName : String;
  };
}
