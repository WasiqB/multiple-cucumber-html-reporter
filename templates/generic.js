$('.x_title').on('click', function () {
    var $BOX_PANEL = $(this).closest('.x_panel'),
        $ICON = $(this).find('.collapse-link i'),
        $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        $BOX_CONTENT_1 = $BOX_PANEL.find('.x_content_new');

    // fix for some div with hardcoded fix class
    if ($BOX_PANEL.attr('style')) {
        $BOX_CONTENT.slideToggle(200, function () {
            $BOX_PANEL.removeAttr('style');
            $BOX_PANEL.css('border', '2px solid');
        });
        
        $BOX_CONTENT_1.slideToggle(200, function () {
            $BOX_PANEL.removeAttr('style');
            $BOX_PANEL.css('display', 'block');
            $BOX_PANEL.css('border', '2px solid');
        });
    } else {
        $BOX_CONTENT.slideToggle(200);
        // $BOX_CONTENT_1.slideToggle(200);
        $BOX_PANEL.css('height', 'auto');
        $BOX_PANEL.css('display', 'block');
        $BOX_PANEL.css('border', '2px solid');
    }

    $ICON.toggleClass('fa-chevron-up fa-chevron-down');
});

$('body').tooltip({
    selector: '[data-toggle="tooltip"]'
});