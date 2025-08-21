import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";

actor CheckVero {
    
    // Types
    public type UserRole = {
        #citizen;
        #business;
        #admin;
    };
    
    public type ReportType = {
        #call;
        #email;
        #ai_chat;
    };
    
    public type User = {
        id: Text;
        principal: Principal;
        username: Text;
        email: Text;
        role: UserRole;
        company_name: ?Text;
        points: Nat;
        created_at: Int;
        is_active: Bool;
    };
    
    public type PhoneNumber = {
        id: Text;
        phone_number: Text;
        company_name: Text;
        description: ?Text;
        registered_by: Text;
        verified: Bool;
        verification_date: Int;
        verification_count: Nat;
        is_active: Bool;
    };
    
    public type FraudReport = {
        id: Text;
        user_id: Text;
        report_type: ReportType;
        phone_number: ?Text;
        email_address: ?Text;
        description: Text;
        risk_level: Text;
        recommendation: Text;
        points_awarded: Nat;
        created_at: Int;
    };
    
    public type ApiResponse<T> = Result.Result<T, Text>;
    
    // State Storage
    private stable var userEntries : [(Text, User)] = [];
    private stable var phoneEntries : [(Text, PhoneNumber)] = [];
    private stable var reportEntries : [(Text, FraudReport)] = [];
    private stable var nextUserId : Nat = 1;
    private stable var nextPhoneId : Nat = 1;
    private stable var nextReportId : Nat = 1;
    
    private var users = HashMap.HashMap<Text, User>(10, Text.equal, Text.hash);
    private var phoneNumbers = HashMap.HashMap<Text, PhoneNumber>(10, Text.equal, Text.hash);
    private var fraudReports = HashMap.HashMap<Text, FraudReport>(10, Text.equal, Text.hash);
    private var userPrincipals = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
    
    // Initialize with sample data
    private func initializeSampleData() : () {
        let samplePhones = [
            {
                id = "phone1";
                phone_number = "+31612345678";
                company_name = "Acme Bank";
                description = ?"Customer Service Line";
                registered_by = "system";
                verified = true;
                verification_date = Time.now();
                verification_count = 0;
                is_active = true;
            },
            {
                id = "phone2";
                phone_number = "+61298765432";
                company_name = "Gov Australia";
                description = ?"Government Services";
                registered_by = "system";
                verified = true;
                verification_date = Time.now();
                verification_count = 0;
                is_active = true;
            },
            {
                id = "phone3";
                phone_number = "+14155552020";
                company_name = "TechCorp Support";
                description = ?"Technical Support Hotline";
                registered_by = "system";
                verified = true;
                verification_date = Time.now();
                verification_count = 0;
                is_active = true;
            },
            {
                id = "phone4";
                phone_number = "+442071234567";
                company_name = "British Telecom";
                description = ?"Customer Services";
                registered_by = "system";
                verified = true;
                verification_date = Time.now();
                verification_count = 0;
                is_active = true;
            }
        ];
        
        for (phone in samplePhones.vals()) {
            phoneNumbers.put(phone.phone_number, phone);
        };
    };
    
    // System upgrade hooks
    system func preupgrade() {
        userEntries := Iter.toArray(users.entries());
        phoneEntries := Iter.toArray(phoneNumbers.entries());
        reportEntries := Iter.toArray(fraudReports.entries());
    };
    
    system func postupgrade() {
        users := HashMap.fromIter<Text, User>(userEntries.vals(), userEntries.size(), Text.equal, Text.hash);
        phoneNumbers := HashMap.fromIter<Text, PhoneNumber>(phoneEntries.vals(), phoneEntries.size(), Text.equal, Text.hash);
        fraudReports := HashMap.fromIter<Text, FraudReport>(reportEntries.vals(), reportEntries.size(), Text.equal, Text.hash);
        userEntries := [];
        phoneEntries := [];
        reportEntries := [];
        
        // Rebuild principal mapping
        for ((userId, user) in users.entries()) {
            userPrincipals.put(user.principal, userId);
        };
        
        // Initialize sample data if empty
        if (phoneNumbers.size() == 0) {
            initializeSampleData();
        };
    };
    
    // Helper Functions
    private func generateId(prefix: Text, counter: Nat) : Text {
        prefix # Nat.toText(counter);
    };
    
    private func getCurrentUser(caller: Principal) : ?User {
        switch (userPrincipals.get(caller)) {
            case (?userId) { users.get(userId) };
            case null { null };
        }
    };
    
    private func analyzeReport(description: Text, phoneNumber: ?Text) : (Text, Text, Nat) {
        let suspiciousWords = ["urgent", "click now", "verify account", "suspended", "prize", "winner", "lottery"];
        var riskScore = 0;
        let lowerDesc = Text.map(description, func (c: Char) : Char {
            if (c >= 'A' and c <= 'Z') {
                Char.fromNat32(Char.toNat32(c) + 32)
            } else {
                c
            }
        });
        
        for (word in suspiciousWords.vals()) {
            if (Text.contains(lowerDesc, #text word)) {
                riskScore += 1;
            };
        };
        
        if (riskScore >= 2) {
            ("HIGH", "🚨 HIGH RISK - This appears to be a scam. Do not provide personal information.", 30)
        } else if (riskScore == 1) {
            ("MEDIUM", "⚠️ MEDIUM RISK - Exercise caution. Verify through official channels.", 20)
        } else {
            ("LOW", "✅ LOW RISK - No obvious red flags detected.", 10)
        }
    };
    
    // Public API Functions
    
    // User Management
    public query func whoami() : async Principal {
        Principal.fromActor(CheckVero)
    };
    
    public func registerUser(username: Text, email: Text, role: UserRole, companyName: ?Text) : async ApiResponse<User> {
        let caller = Principal.fromActor(CheckVero); // In real implementation, use msg.caller
        let userId = generateId("user", nextUserId);
        nextUserId += 1;
        
        // Check if username already exists
        for ((_, user) in users.entries()) {
            if (user.username == username) {
                return #err("Username already exists");
            };
        };
        
        let newUser : User = {
            id = userId;
            principal = caller;
            username = username;
            email = email;
            role = role;
            company_name = companyName;
            points = 0;
            created_at = Time.now();
            is_active = true;
        };
        
        users.put(userId, newUser);
        userPrincipals.put(caller, userId);
        
        #ok(newUser)
    };
    
    public query func getUser(userId: Text) : async ApiResponse<User> {
        switch (users.get(userId)) {
            case (?user) { #ok(user) };
            case null { #err("User not found") };
        }
    };
    
    public query func getCurrentUserProfile() : async ApiResponse<User> {
        let caller = Principal.fromActor(CheckVero); // In real implementation, use msg.caller
        switch (getCurrentUser(caller)) {
            case (?user) { #ok(user) };
            case null { #err("User not authenticated") };
        }
    };
    
    // Phone Number Management
    public func registerPhoneNumber(phoneNumber: Text, companyName: Text, description: ?Text) : async ApiResponse<PhoneNumber> {
        let caller = Principal.fromActor(CheckVero);
        
        switch (getCurrentUser(caller)) {
            case (?user) {
                if (user.role != #business and user.role != #admin) {
                    return #err("Only businesses and admins can register phone numbers");
                };
                
                // Check if phone number already exists
                switch (phoneNumbers.get(phoneNumber)) {
                    case (?_) { return #err("Phone number already registered"); };
                    case null {};
                };
                
                let phoneId = generateId("phone", nextPhoneId);
                nextPhoneId += 1;
                
                let newPhone : PhoneNumber = {
                    id = phoneId;
                    phone_number = phoneNumber;
                    company_name = companyName;
                    description = description;
                    registered_by = user.id;
                    verified = true;
                    verification_date = Time.now();
                    verification_count = 0;
                    is_active = true;
                };
                
                phoneNumbers.put(phoneNumber, newPhone);
                #ok(newPhone)
            };
            case null { #err("User not authenticated") };
        }
    };
    
    public func verifyPhoneNumber(phoneNumber: Text) : async ApiResponse<{company_name: Text; description: ?Text; is_verified: Bool; message: Text; verified_since: Int; verification_count: Nat}> {
        switch (phoneNumbers.get(phoneNumber)) {
            case (?phone) {
                // Update verification count
                let updatedPhone = {
                    id = phone.id;
                    phone_number = phone.phone_number;
                    company_name = phone.company_name;
                    description = phone.description;
                    registered_by = phone.registered_by;
                    verified = phone.verified;
                    verification_date = phone.verification_date;
                    verification_count = phone.verification_count + 1;
                    is_active = phone.is_active;
                };
                phoneNumbers.put(phoneNumber, updatedPhone);
                
                #ok({
                    company_name = phone.company_name;
                    description = phone.description;
                    is_verified = true;
                    message = "✅ This number is verified and belongs to " # phone.company_name;
                    verified_since = phone.verification_date;
                    verification_count = phone.verification_count + 1;
                })
            };
            case null {
                #ok({
                    company_name = "";
                    description = null;
                    is_verified = false;
                    message = "❌ This number is not registered. Proceed with caution.";
                    verified_since = 0;
                    verification_count = 0;
                })
            };
        }
    };
    
    public query func getRegisteredPhoneNumbers() : async [PhoneNumber] {
        Iter.toArray(phoneNumbers.vals())
    };
    
    // Fraud Reporting
    public func submitFraudReport(reportType: ReportType, phoneNumber: ?Text, emailAddress: ?Text, description: Text) : async ApiResponse<{report: FraudReport; ai_analysis: {risk_level: Text; recommendation: Text; confidence_score: Nat; points_awarded: Nat; reasons: [Text]}}> {
        let caller = Principal.fromActor(CheckVero);
        
        switch (getCurrentUser(caller)) {
            case (?user) {
                if (user.role != #citizen) {
                    return #err("Only citizens can submit fraud reports");
                };
                
                let reportId = generateId("report", nextReportId);
                nextReportId += 1;
                
                let (riskLevel, recommendation, pointsAwarded) = analyzeReport(description, phoneNumber);
                
                let newReport : FraudReport = {
                    id = reportId;
                    user_id = user.id;
                    report_type = reportType;
                    phone_number = phoneNumber;
                    email_address = emailAddress;
                    description = description;
                    risk_level = riskLevel;
                    recommendation = recommendation;
                    points_awarded = pointsAwarded;
                    created_at = Time.now();
                };
                
                fraudReports.put(reportId, newReport);
                
                // Award points to user
                let updatedUser = {
                    id = user.id;
                    principal = user.principal;
                    username = user.username;
                    email = user.email;
                    role = user.role;
                    company_name = user.company_name;
                    points = user.points + pointsAwarded;
                    created_at = user.created_at;
                    is_active = user.is_active;
                };
                users.put(user.id, updatedUser);
                
                let aiAnalysis = {
                    risk_level = riskLevel;
                    recommendation = recommendation;
                    confidence_score = if (riskLevel == "HIGH") 85 else if (riskLevel == "MEDIUM") 60 else 30;
                    points_awarded = pointsAwarded;
                    reasons = if (riskLevel == "HIGH") ["Multiple suspicious keywords detected", "Pattern matches known scam techniques"] 
                             else if (riskLevel == "MEDIUM") ["Some suspicious language detected"]
                             else ["No obvious red flags identified"];
                };
                
                #ok({report = newReport; ai_analysis = aiAnalysis})
            };
            case null { #err("User not authenticated") };
        }
    };
    
    public query func getFraudReports() : async [FraudReport] {
        Iter.toArray(fraudReports.vals())
    };
    
    public query func getUserFraudReports(userId: Text) : async [FraudReport] {
        let userReports = Buffer.Buffer<FraudReport>(0);
        for (report in fraudReports.vals()) {
            if (report.user_id == userId) {
                userReports.add(report);
            };
        };
        Buffer.toArray(userReports)
    };
    
    // Statistics and Analytics
    public query func getSystemStats() : async {total_users: Nat; total_phones: Nat; total_reports: Nat; high_risk_reports: Nat} {
        var highRiskCount = 0;
        for (report in fraudReports.vals()) {
            if (report.risk_level == "HIGH") {
                highRiskCount += 1;
            };
        };
        
        {
            total_users = users.size();
            total_phones = phoneNumbers.size();
            total_reports = fraudReports.size();
            high_risk_reports = highRiskCount;
        }
    };
    
    public query func getUserStats(userId: Text) : async ApiResponse<{reports_count: Nat; total_points: Nat; high_risk_reports: Nat}> {
        switch (users.get(userId)) {
            case (?user) {
                var userReportsCount = 0;
                var userHighRiskReports = 0;
                
                for (report in fraudReports.vals()) {
                    if (report.user_id == userId) {
                        userReportsCount += 1;
                        if (report.risk_level == "HIGH") {
                            userHighRiskReports += 1;
                        };
                    };
                };
                
                #ok({
                    reports_count = userReportsCount;
                    total_points = user.points;
                    high_risk_reports = userHighRiskReports;
                })
            };
            case null { #err("User not found") };
        }
    };
    
    // Dashboard Statistics
    public query func getDashboardStats(userId: Text) : async ApiResponse<{
        total_reports: Nat;
        points_earned: Nat;
        high_risk_reports: Nat;
        registered_numbers: Nat;
        verification_checks: Nat;
        reports_mentioning: Nat;
        total_users: Nat;
        total_phone_numbers: Nat;
    }> {
        switch (users.get(userId)) {
            case (?user) {
                var userReports = 0;
                var userHighRisk = 0;
                var registeredNumbers = 0;
                var verificationChecks = 0;
                var reportsMentioning = 0;
                
                // Count user reports
                for (report in fraudReports.vals()) {
                    if (report.user_id == userId) {
                        userReports += 1;
                        if (report.risk_level == "HIGH") {
                            userHighRisk += 1;
                        };
                    };
                };
                
                // Count registered numbers (for businesses)
                for (phone in phoneNumbers.vals()) {
                    if (phone.registered_by == userId) {
                        registeredNumbers += 1;
                        verificationChecks += phone.verification_count;
                    };
                };
                
                #ok({
                    total_reports = userReports;
                    points_earned = user.points;
                    high_risk_reports = userHighRisk;
                    registered_numbers = registeredNumbers;
                    verification_checks = verificationChecks;
                    reports_mentioning = reportsMentioning;
                    total_users = users.size();
                    total_phone_numbers = phoneNumbers.size();
                })
            };
            case null { #err("User not found") };
        }
    };
    
    // Initialize sample data on first deployment
    public func initializeSampleDataPublic() : async Text {
        initializeSampleData();
        "Sample data initialized successfully"
    };
    
    // Health check
    public query func health() : async Text {
        "Check Vero ICP Backend - Running"
    };
}