// reservas/static/js/planning.js

document.addEventListener('DOMContentLoaded', function () {
    var table = document.querySelector('.planning-table');
    var header = table.querySelector('thead');
    var fixedColumns = table.querySelectorAll('tbody tr td:first-child, tbody tr td:nth-child(2)');

    function fixHeader() {
        var scrollLeft = table.parentElement.scrollLeft;
        header.style.transform = 'translateX(' + (-scrollLeft) + 'px)';
    }

    function fixColumns() {
        var scrollLeft = table.parentElement.scrollLeft;
        fixedColumns.forEach(function (cell) {
            cell.style.transform = 'translateX(' + scrollLeft + 'px)';
        });
    }

    table.parentElement.addEventListener('scroll', function () {
        fixHeader();
        fixColumns();
    });

    fixHeader();
    fixColumns();
});
