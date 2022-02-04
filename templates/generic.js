$('.x_title').on('click', function () {
    var $BOX_PANEL = $(this).closest('.x_panel'),
        $ICON = $(this).find('.collapse-link i'),
        $BOX_CONTENT = $BOX_PANEL.find('.x_content');

    // fix for some div with hardcoded fix class
    if ($BOX_PANEL.attr('style')) {
        $BOX_CONTENT.slideToggle(200, function () {
            $BOX_PANEL.removeAttr('style');
        });
    } else {
        $BOX_CONTENT.slideToggle(200);
        $BOX_PANEL.css('height', 'auto');
    }

    $ICON.toggleClass('fa-chevron-up fa-chevron-down');
});

$('body').tooltip({
    selector: '[data-toggle="tooltip"]'
});

$('#passed').on('click', () => hideResult('passed'));
$('#failed').on('click', () => hideResult('failed'))
$('#pending').on('click', () => hideResult('pending'))
$('#skipped').on('click', () => hideResult('skipped'))
$('#not_defined').on('click', () => hideResult('not-defined'))
$('#ambiguous').on('click', () => hideResult('ambiguous'))
$('#clear').on('click', () => showAll())

function hideResult(stepResult) {
    $('span[class*=step]').closest('div.x_panel[style]').hide();
    $('span[class*=' + stepResult + ']').closest('div.x_panel[style]').show();
}

function showAll() {
    $('span[class*=step]').closest('div.x_panel[style]').show();
}
