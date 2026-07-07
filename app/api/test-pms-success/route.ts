/**
 * Test endpoint simulating successful PMS API response
 * Used to demonstrate dashboard with real employee data
 */

export async function GET() {
  // Simulated employee data in PMS format
  const testEmployees = [
    {
      EmpCode: "EMP001",
      FirstName: "Rajesh",
      LastName: "Kumar",
      DeptName: "Software Development",
      DOJ: "2026-07-01",
      Email: "rajesh.kumar@koenigsolutions.com",
      Phone: "9876543210",
    },
    {
      EmpCode: "EMP002",
      FirstName: "Priya",
      LastName: "Verma",
      DeptName: "HR & Administration",
      DOJ: "2026-07-02",
      Email: "priya.verma@koenigsolutions.com",
      Phone: "9876543211",
    },
    {
      EmpCode: "EMP003",
      FirstName: "Arjun",
      LastName: "Singh",
      DeptName: "Quality Assurance",
      DOJ: "2026-07-03",
      Email: "arjun.singh@koenigsolutions.com",
      Phone: "9876543212",
    },
    {
      EmpCode: "EMP004",
      FirstName: "Sneha",
      LastName: "Patel",
      DeptName: "Finance & Accounts",
      DOJ: "2026-07-04",
      Email: "sneha.patel@koenigsolutions.com",
      Phone: "9876543213",
    },
    {
      EmpCode: "EMP005",
      FirstName: "Vikram",
      LastName: "Reddy",
      DeptName: "Sales & Marketing",
      DOJ: "2026-07-05",
      Email: "vikram.reddy@koenigsolutions.com",
      Phone: "9876543214",
    },
    {
      EmpCode: "EMP006",
      FirstName: "Anjali",
      LastName: "Gupta",
      DeptName: "Product Management",
      DOJ: "2026-07-06",
      Email: "anjali.gupta@koenigsolutions.com",
      Phone: "9876543215",
    },
  ];

  return Response.json({
    statuscode: 200,
    message: "Success",
    data: testEmployees,
    ResponseData: {
      EmployeeDetails: testEmployees,
    },
  });
}
