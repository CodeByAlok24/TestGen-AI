
## **Deliverables**

Participants are expected to submit the following deliverables:

### **1. Backend Service**
Participants should provide a backend service that:

- Accepts code snippets, API definitions, or software requirements as input  
- Processes the input and generates relevant test cases  
- Returns test cases in formats such as pytest, JUnit, or Jest  

**Example Output:**

**Feature:** User Login API (Endpoint: `/api/login`)

| Test Case            | Input                                      | Expected Output                     |
|---------------------|-------------------------------------------|------------------------------------|
| Valid Login         | Email: user@example.com <br> Pass: correct_password | 200 OK <br> Token generated        |
| Invalid Password    | Email: user@example.com <br> Pass: wrong_password   | 401 Unauthorized <br> Invalid credentials |
| Missing Password    | Email: user@example.com <br> Pass: (empty)         | 400 Bad Request <br> Password is required |
| Invalid Email       | Email: userexample.com <br> Pass: password123      | 400 Bad Request <br> Invalid email format |
| SQL Injection       | Email: ' OR 1=1 -- <br> Pass: test123              | 400 Bad Request <br> Invalid input detected |

---

### **2. Source Code & Documentation**
Participants must include:

- System architecture  
- AI models or APIs used  
- Steps to run the project  

---

### **3. Demo Presentation**
Participants should present:

- A working demo  
- Explanation of the approach  
- Possible future improvements 