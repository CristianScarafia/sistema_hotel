document.addEventListener('DOMContentLoaded', function() {
    var dateContainer = document.getElementById('date-container');
    dateContainer.addEventListener('dblclick', function(event) {
        var currentDate = this.dataset.date;
        var input = document.createElement('input');
        input.type = 'date';
        input.value = currentDate;
        input.addEventListener('blur', function() {
            var newDate = this.value;
            if (newDate) {
                window.location.href = updateQueryStringParameter(window.location.href, 'start_date', newDate);
            }
        });
        this.innerHTML = '';
        this.appendChild(input);
        input.focus();
    });
});

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

