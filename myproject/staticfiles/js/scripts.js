document.addEventListener('DOMContentLoaded', function() {
    // Filter table function
    window.filterTable = function() {
        let input = document.getElementById('filterInput');
        let filter = input.value.toUpperCase();
        let table = document.getElementById('planningTable');
        let tr = table.getElementsByTagName('tr');

        for (let i = 1; i < tr.length; i++) {
            let td = tr[i].getElementsByTagName('td')[0];
            if (td) {
                let txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    };

    // Show details in a modal
    window.showDetails = function(room, guest) {
        let modal = document.getElementById('detailsModal');
        let modalText = document.getElementById('modalText');
        modalText.innerHTML = `Habitación: ${room} <br> Huesped: ${guest}`;
        modal.style.display = "block";
    };

    // Close modal
    window.closeModal = function() {
        let modal = document.getElementById('detailsModal');
        modal.style.display = "none";
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        let modal = document.getElementById('detailsModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});

