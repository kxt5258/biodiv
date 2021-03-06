$(document).ready(function(){
    $("#distinctRecoTableAction").click(loadDistinctRecoList);
});

function updateDistinctRecoTable(){
	$('#distinctRecoTable tbody').empty();
	var me = $('#distinctRecoTableAction');
	$(me).show();
	$(me).data('offset', 0);
	$(me).click();
}

function loadDistinctRecoList() {
    var $me = $(this);
    var target = window.location.pathname + window.location.search;
    var a = $('<a href="'+target+'"></a>');
    var url = a.url();
    var href = url.attr('path');
    var params = getFilterParameters(url);
    params['max'] = $(this).data('max');
    params['offset'] = $(this).data('offset');
    var $distinctRecoTable = $('#distinctRecoTable');
    $.ajax({
        url:window.params.observation.distinctRecoListUrl,
        dataType: "json",
        data:params,
        success: function(data) {
            $('#distinctRecoList .distinctRecoHeading').html(data.totalRecoCount?(' (' + data.totalRecoCount + ')'):'');
            if(data.status === 'success') {
                $.each(data.distinctRecoList, function(index, item) {
                    if(item[1])
                    $distinctRecoTable.append('<tr><td><i>'+item[0]+'</i></td><td>'+item[2]+'</td></tr>');  
                    else
                    $distinctRecoTable.append('<tr><td>'+item[0]+'</td><td>'+item[2]+'</td></tr>');
                });
                $me.data('offset', data.next);
                if(!data.next){
                    $me.hide();
                }
            } else {
                $me.hide();
            }
        }
    });
}
