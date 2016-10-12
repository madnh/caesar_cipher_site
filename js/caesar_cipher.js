var characters = [],
    character_indexed = {},
    character_replace_cached = {},
    character_missing_cached = {};

/**
 *
 * @param secret_string
 * @param shift_number
 * @param {boolean} [use_cache = false]
 * @param on_missing
 * @return {{result: string, missing: Array}}
 */
function caesar_cipher(secret_string, shift_number, use_cache, on_missing) {
    var caesar_result = [],
        missing_char,
        missing_chars = [],
        curr_index,
        curr_char,
        new_index,
        new_char;

    if(typeof use_cache === 'undefined'){
        use_cache = true;
    }

    for (var i = 0; i < secret_string.length; i++) {
        curr_char = secret_string[i];

        if (curr_char.trim().length === 0) {
            caesar_result.push(curr_char);
            continue;
        }
        if (character_missing_cached.hasOwnProperty(curr_char)) {
            missing_chars.push(curr_char);
        }
        if (use_cache && character_replace_cached.hasOwnProperty(curr_char)) {
            caesar_result.push(character_replace_cached[curr_char]);
            continue;
        }
        if (!character_indexed.hasOwnProperty(curr_char)) {
            missing_chars.push(curr_char);
            character_missing_cached[curr_char] = 1;

            if (on_missing) {
                missing_char = on_missing(curr_char);
            } else {
                missing_char = curr_char;
            }

            caesar_result.push(missing_char);
            character_replace_cached[curr_char] = missing_char;
            continue;
        }

        curr_index = character_indexed[curr_char];
        new_index = curr_index + shift_number;

        if (new_index < 0) {
            new_index += characters.length;
        }

        new_index %= characters.length;
        new_char = characters[new_index];

        caesar_result.push(new_char);

        if(use_cache){
            character_replace_cached[curr_char] = new_char;
        }
    }

    return {
        result: caesar_result.join(''),
        missing: missing_chars
    };
}

function debug(shift_number) {
    var content = [], new_index;

    for (var i = 0; i < characters.length; i++) {
        new_index = i + shift_number;
        if (new_index < 0) {
            new_index += characters.length;
        }
        content.push({
            src: characters[i],
            dest: characters[new_index % characters.length]
        });
    }

    return content;
}

function isEncryptMode() {
    return $('input[name="mode"]:checked').val() === 'encrypt';
}

function onMissingCB(missing_char) {
    if (!missing_char.trim().length) {
        return missing_char;
    }

    return '<strong class="text-danger">' + missing_char + '</strong>';
}

function caesar_manual() {
    var secret_string = $('#source').val().trim(),
        shift_number, result;

    if (!secret_string.length) {
        return;
    }

    shift_number = parseInt($('#shift_number').val());
    result = caesar_cipher(secret_string, isEncryptMode() ? shift_number : -1 * shift_number, true, onMissingCB);

    $('#result').html(result.result.replace(/(?:\r\n|\r|\n)/g, '<br />'));

    addDebugInfo(shift_number);
}
function caesar_list() {
    var secret_string = $('#source').val().trim(),
        result = [],
        tmp_result,
        list_table = $('#list_table'),
        list_table_body = list_table.find('tbody');

    $('#first_character').text(characters[0]);
    list_table_body.html('');

    for (var i = 1; i < characters.length; i++) {
        tmp_result = caesar_cipher(secret_string, isEncryptMode() ? i : -1 * i, false, onMissingCB);
        list_table_body.append([
            '<tr>',
            '<td>' + i + '</td>',
            '<td>' + characters[i] + '</td>',
            '<td class="text-success"><p class="lead"><strong>' + tmp_result.result + '</strong></p></td>',
            '</tr>'
        ].join("\n"));
    }
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

function changeShiftNumberValue(number) {
    var shif_number_dom = $('#shift_number'),
        curr_value = parseInt(shif_number_dom.val()),
        new_value = correctIndex(curr_value + number);

    if (new_value === 0) {
        new_value = correctIndex(new_value + number);
    }

    if (curr_value != new_value) {
        reset_cache();
        shif_number_dom.val(new_value).change();
    }
}
function increase() {
    changeShiftNumberValue(1);
}
function decrease() {
    changeShiftNumberValue(-1);
}

function correctIndex(index) {
    index %= characters.length;

    if (index < 0) {
        index += characters.length;
    }

    return index;
}

function reset_cache() {
    character_replace_cached = {};
    character_missing_cached = {};
}
function updateCharacterList(new_character_list, callback) {
    characters = new_character_list.trim().split('');
    character_indexed = {};
    reset_cache();

    for (var i = 0; i < characters.length; i++) {
        character_indexed[characters[i]] = i;
    }

    if (callback) {
        callback();
    }
}
$('document').ready(function () {
    var alphabet_characters = 'abcdefghijklmnopqrstuvwxyz';
    var character_list = $('#character_list');

    character_list.on('change', function () {
        updateCharacterList($(this).val());
    });

    $('#character_list_upper').click(function () {
        character_list.val(character_list.val().toUpperCase()).change();
    });
    $('#character_list_lower').click(function () {
        character_list.val(character_list.val().toLowerCase()).change();
    });


    $('#shift_number').attr('max', characters.length)
        .attr('aria-valuemax', characters.length);

    $('#shift_number').change(caesar_manual);
    $('input[name="mode"]').change(reset_cache);

    $('.characters_alphabet').click(function () {
        character_list.val(alphabet_characters).change();
    }).click();

    $('#list_modal').on('shown.bs.modal', caesar_list);
    $('#manual_modal').on('shown.bs.modal', caesar_manual);
});