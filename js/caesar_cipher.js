var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    character_indexed = {};


function indexCharacterList() {
    for (var i = 0; i < characters.length; i++) {
        character_indexed[characters[i]] = i;
    }
}

function caesar_cipher(secret_string, shift_number) {
    var result = [],
        curr_index, new_index, new_char;

    for (var i = 0; i < secret_string.length; i++) {
        if (!character_indexed.hasOwnProperty(secret_string[i])) {
            result.push(secret_string[i]);
            continue;
        }

        curr_index = character_indexed[secret_string[i]];
        new_index = curr_index + shift_number;

        if (new_index < 0) {
            new_index += characters.length;
        }

        new_index %= characters.length;

        new_char = characters[new_index];

        result.push(new_char);
    }

    return result.join('');
}

function debug(shift_number) {
    var content = [];

    for (var i = 0; i < characters.length; i++) {
        content.push({
            src: characters[i],
            dest: characters[(i + shift_number) % characters.length]
        });
    }

    return content;
}

function isEncryptMode() {
    return $('input[name="mode"]:checked').val() === 'encrypt';
}
function caesar_it() {
    var secret_string = $('#source').val().toUpperCase(),
        shift_number = parseInt($('#shift_number').val());

    $('#result').val(caesar_cipher(secret_string, isEncryptMode() ? shift_number : -1 * shift_number));
    addDebugInfo(shift_number);
}

function addDebugInfo(shift_number) {
    var debug_content = debug(shift_number),
        dom_debug_table_body = $('#debug_table tbody');

    dom_debug_table_body.html('');

    for (var i = 0; i < debug_content.length; i++) {
        dom_debug_table_body.append([
            '<tr>',
            '<td>' + i + '</td>',
            '<td>' + debug_content[i].src + '</td>',
            '<td>' + debug_content[i].dest + '</td>',
            '</tr>'
        ].join(''));
    }
}

function increase() {
    var shif_number_dom = $('#shift_number'),
        new_value = (parseInt(shif_number_dom.val()) + 1) % characters.length;

    shif_number_dom.val(new_value).change();
}
function decrease() {
    var shif_number_dom = $('#shift_number'),
        new_value = (parseInt(shif_number_dom.val()) - 1) % characters.length;

    shif_number_dom.val(new_value).change();
}

$('document').ready(function () {
    indexCharacterList();

    $('#shift_number').attr('max', characters.length)
        .attr('aria-valuemax', characters.length);

    $('#shift_number, input[name="mode"]').change(caesar_it);
});