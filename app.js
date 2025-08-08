document.addEventListener("DOMContentLoaded", () => {
    // Check if jsPDF is defined
    const jsPDF = window.jspdf?.jsPDF;

    // Page specific logic
    if (document.getElementById("class-dropdown")) {
        // Elements
        const classDropdown = document.getElementById("class-dropdown");
        const datePicker = document.getElementById("date-picker");
        const continueBtn = document.getElementById("continue-btn");

        // Set date to today
        datePicker.valueAsDate = new Date();

        // Populate class dropdown
        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls.id;
            option.textContent = `${cls.id} – ${cls.name} – ${cls.professor}`;
            classDropdown.appendChild(option);
        });

        // Continue button event listener
        continueBtn.addEventListener("click", () => {
            const selectedDate = datePicker.value;
            const selectedClassId = classDropdown.value;
            if (selectedDate && selectedClassId) {
                localStorage.setItem("selectedDate", selectedDate);
                localStorage.setItem("selectedClassId", selectedClassId);
                window.location.href = "attendance.html";
            } else {
                alert("Please select a date and a class.");
            }
        });
    }

    if (document.getElementById("student-grid")) {
        // Elements
        const studentGrid = document.getElementById("student-grid");
        const attendanceInfo = document.getElementById("attendance-info");
        const exportPdfBtn = document.getElementById("export-pdf-btn");

        // Get data from local storage
        const selectedDate = localStorage.getItem("selectedDate");
        const selectedClassId = localStorage.getItem("selectedClassId");

        if (selectedDate && selectedClassId) {
            const selectedClass = classes.find(cls => cls.id === selectedClassId);
            
            // Display attendance info
            attendanceInfo.innerHTML = `
                <p><strong>Date:</strong> ${selectedDate}</p>
                <p><strong>Class:</strong> ${selectedClass.name} (${selectedClass.id})</p>
                <p><strong>Professor:</strong> ${selectedClass.professor}</p>
            `;

            // Populate student grid
            students.forEach(student => {
                i=1;
                const studentBox = document.createElement("div");
                studentBox.classList.add("student-box", "absent");
                studentBox.dataset.roll = student.roll;
                studentBox.innerHTML = `
                    <p class="student-roll">${student.roll}</p>
                    <p class="student-name">${student.name}</p>
                `;
                studentBox.addEventListener("click", () => {
                    studentBox.classList.toggle("present");
                    studentBox.classList.toggle("absent");
                });
                studentGrid.appendChild(studentBox);
            });
        } else {
            // Redirect if no data found
            window.location.href = "selection.html";
        }

        // Export to PDF button event listener
        exportPdfBtn.addEventListener("click", () => {
            if (!jsPDF) {
                alert("Error: jsPDF library not loaded.");
                return;
            }

            const presentStudents = [];
            document.querySelectorAll(".student-box.present").forEach(box => {
                const roll = box.dataset.roll;
                const student = students.find(s => s.roll === roll);
                presentStudents.push(student);
            });

            presentStudents.sort((a, b) => a.roll.localeCompare(b.roll));

            const selectedClass = classes.find(cls => cls.id === selectedClassId);
            const doc = new jsPDF();

            // PDF content
             doc.setFontSize(20);
            doc.text("Attendance Report", 105, 20, { align: "center" });

            doc.setFontSize(12);
            doc.text(`Date: ${selectedDate}`, 20, 40);
            doc.text(`Professor: ${selectedClass.professor}`, 20, 50);
            doc.text(`Course: ${selectedClass.name} (${selectedClass.id})`, 20, 60);

            doc.setFontSize(14);
            doc.text("Present Students", 20, 80);

            let y = 90;
            presentStudents.forEach((student, index) => {
                doc.setFontSize(12);
                doc.text(`${index + 1}. ${student.roll} – ${student.name}`, 20, y);
                y += 10;
            });

            // Save the PDF
            doc.save(`Attendance_${selectedClass.id}_${selectedDate}.pdf`);
        });
    }
});