document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf;

    if (document.body.contains(document.getElementById("class-dropdown"))) {
        const classDropdown = document.getElementById("class-dropdown");
        const datePicker = document.getElementById("date-picker");
        const continueBtn = document.getElementById("continue-btn");

        datePicker.valueAsDate = new Date();

        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls.id;
            option.textContent = `${cls.id} – ${cls.name} – ${cls.professor}`;
            classDropdown.appendChild(option);
        });

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

    if (document.body.contains(document.getElementById("student-grid"))) {
        const studentGrid = document.getElementById("student-grid");
        const attendanceInfo = document.getElementById("attendance-info");
        const exportPdfBtn = document.getElementById("export-pdf-btn");

        const selectedDate = localStorage.getItem("selectedDate");
        const selectedClassId = localStorage.getItem("selectedClassId");

        if (selectedDate && selectedClassId) {
            const selectedClass = classes.find(cls => cls.id === selectedClassId);
            attendanceInfo.innerHTML = `
                <p><strong>Date:</strong> ${selectedDate}</p>
                <p><strong>Class:</strong> ${selectedClass.name} (${selectedClass.id})</p>
                <p><strong>Professor:</strong> ${selectedClass.professor}</p>
            `;

            students.forEach(student => {
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
            window.location.href = "selection.html";
        }

        exportPdfBtn.addEventListener("click", () => {
            const presentStudents = [];
            document.querySelectorAll(".student-box.present").forEach(box => {
                const roll = box.dataset.roll;
                const student = students.find(s => s.roll === roll);
                presentStudents.push(student);
            });

            presentStudents.sort((a, b) => a.roll.localeCompare(b.roll));

            const selectedClass = classes.find(cls => cls.id === selectedClassId);
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("Attendance Report", 105, 20, { align: "center" });

            doc.setFontSize(12);
            doc.text(`Date: ${selectedDate}`, 20, 40);
            doc.text(`Professor: ${selectedClass.professor}`, 20, 50);
            doc.text(`Course: ${selectedClass.name} (${selectedClass.id})`, 20, 60);

            doc.setFontSize(14);
            doc.text("Present Students", 20, 80);

            let y = 90;
            presentStudents.forEach(student => {
                doc.setFontSize(10);
                doc.text(`${student.roll} – ${student.name}`, 20, y);
                y += 10;
            });

            doc.save(`Attendance_${selectedClass.id}_${selectedDate}.pdf`);
        });
    }
});