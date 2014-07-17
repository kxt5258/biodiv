$("#addBulkObservationsSubmit").click(function(){bulkObservationSubmission(this, false)});

$("#addBulkObservationsAndListPage").click(function(){bulkObservationSubmission(this, true)});

function bulkObservationSubmission(ele, showListPage){
    var me = ele;
    console.log("==============WHICH BUTTON=============");
    console.log(me);
    if($(me).hasClass('disabled')) {
        alert("Uploading is in progress. Please submit after it is over.");
        event.preventDefault();
        return false; 		 		
    }

    if (document.getElementById('agreeTerms').checked) {
        $("#addBulkObservationsSubmit").addClass("disabled");
        $("#addBulkObservationsAndListPage").addClass("disabled");
        var allForms = $(".addObservation");
        var formsWithData = [] 
            $.each(allForms, function(index, value){
                if(formHasData(value)){
                    console.log("==============================================");
                    formsWithData.push(value);
                }
            });
        var size = formsWithData.length;
        if(size == 0) {
            $("#addBulkObservationsSubmit").removeClass("disabled");
            $("#addBulkObservationsAndListPage").removeClass("disabled");
            return false;
        }
        submitForms(0, size, formsWithData, showListPage); 
        return false;
    } else {
        alert("Please agree to the terms mentioned at the end of the form to submit the observation.");    
        $("#addBulkObservationsSubmit").removeClass("disabled");
        $("#addBulkObservationsAndListPage").removeClass("disabled");
    }

}

function formHasData(form){
    if($(form).find(".createdObv").is(":visible")) {
        return false;
    }
    if($(form).find(".imageHolder .addedResource").length != 0){
        return true;
    }
    var inputNames  = ['habitat_id', 'group_id', 'fromDate']
    var flag = false;
    $.each(inputNames, function(index, value){   
        if($(form).find("input[name='"+value+"']").val() != ""){
            flag = true;
            return;
        }
    });
    return flag;
}

var gotError;
var errorCount;
var miniObvCreateHtmlSuccess;
function submitForms(counter, size, allForms, showListPage){
    if(counter == 0){
        gotError = false;
        errorCount = 0;
    }
    if(counter == size){
        console.log("breaking recursion========" + gotError);
        alert("Observations created successfully = " + (counter - errorCount) + "\n Errors in observation submission = " +errorCount);
        
        if(!showListPage) {
            if(!gotError){
                var allFormsOnPage = $(".addObservation");
                $.each(allFormsOnPage, function(index, value){
                    var wrapper = $(value).parent();
                    $(value).replaceWith(miniObvCreateHtmlSuccess);
                });
            }
            initializers();
            $('html, body').animate({
                scrollTop: $(".togglePropagateDiv").offset().top
            }, 1000);
            $("#addBulkObservationsSubmit").removeClass("disabled");
            $("#addBulkObservationsAndListPage").removeClass("disabled");
        } else {
            window.open(window.params.obvListPage,"_self");
        }
        return;
    } else {
        console.log("going to submit form no : " + counter);
        var form = allForms[counter];
        console.log(allForms[counter]);
        $(form).find(".userGroupsList").val(getSelectedUserGroups($(form)));

        var locationpicker = $(form).find(".map_class").data('locationpicker'); 
        if(locationpicker && locationpicker.mapLocationPicker.drawnItems) {
            var areas = locationpicker.mapLocationPicker.drawnItems.getLayers();
            if(areas.length > 0) {
                var wkt = new Wkt.Wkt();
                wkt.fromObject(areas[0]);
                $(form).find("input.areas").val(wkt.write());
            }
        }
        var imagesPulled = $(form).find(".imageHolder li.addedResource");
        var group_id = $(form).find("input[name='group_id']").val();
        var habitat_id = $(form).find("input[name='habitat_id']").val();
        $(form).ajaxSubmit({
            url : $(this).attr("action"),
            dataType : 'json', 
            type : 'POST',
            success : function(data, statusText, xhr, form) {
                console.log("HERE HERE");
                if(data.statusComplete) {
                    console.log("HELLO IN SUCCESS");
                    miniObvCreateHtmlSuccess = data.miniObvCreateHtml;
                    $(form).find('input').attr('disabled', 'disabled');
                    $(form).find('button').attr('disabled', 'disabled');
                    $(form).find('.createdObv').show();
                    $(form).find('.obvTemplate').css('opacity', '0.3');
                    //disable click on div
                    //document.getElementById('my').style.pointerEvents = 'none';
                } else {
                    gotError = true;
                    errorCount = errorCount + 1;
                    var miniObvCreateHtmlError = data.miniObvCreateHtml;
                    var wrapper = $(form).parent();
                    $(form).replaceWith(miniObvCreateHtmlError);
                    console.log($(miniObvCreateHtmlError));
                    $(wrapper).find(".imageHolder").append(imagesPulled);
                    $(wrapper).find(".group_options li[value='"+group_id+"']").trigger("click");
                    $(wrapper).find(".habitat_options li[value='"+habitat_id+"']").trigger("click");
                }
                $(".resourceListType").val($(".resourceListTypeFilled").val());
                submitForms(counter+1, size, allForms, showListPage);
            }, error : function (xhr, ajaxOptions, thrownError){
                //successHandler is used when ajax login succedes
                alert("Sorry, a server error occured.Please refresh the page & try again or else report the error.");
                console.log("ERROR ERROR");
                var successHandler = this.success;
                handleError(xhr, ajaxOptions, thrownError, successHandler, function() {
                    var response = $.parseJSON(xhr.responseText);
                });
                submitForms(counter+1, size, allForms, showListPage);
                $("#addBulkObservationsSubmit").removeClass("disabled");
                $("#addBulkObservationsAndListPage").removeClass("disabled");
            }  
        });
    }
}

function dropAction(event, ui, ele) {
    console.log("Item was Dropped");
    $(ele).append($(ui.draggable).clone());
    var draggedImages = $(ele).find(".addedResource");
    var countOfImages = draggedImages.length;
    if(countOfImages == 1){
        console.log("FIRST FIRST");
        draggedImages.css({
            "position":"relative",
            "top":"0"
        });

    } else{
        console.log("SECOND SECOND");
        var lastTop = parseInt($(draggedImages[(countOfImages - 2)]).css("top"));
        draggedImages.last().css({
            "position":"absolute",
            "top":lastTop + 20
        });

    }
    console.log("fffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    $(ele).find(".star_obvcreate").last().children().remove();
    var form = $(ele).closest(".addObservation");
    var $ratingCont = $(ele).find(".star_obvcreate").last();
    console.log($ratingCont);
    rate($ratingCont);
    console.log($(ui.draggable));
    $(ui.draggable).draggable('disable');
    //var imageID = $(ui.draggable).find("img").first().attr("class").split(" ")[0];
    //$("."+imageID).first().mousedown(function(){console.log("mouse down");return false;});
    $(ui.draggable).appendTo(".imagesList");
    $(ui.draggable).css("opacity","0.3");
    $(form).find(".address").trigger('click'); 
    $(".imageHolder .addedResource").click(function(){
        console.log("changing z-index");
        form.find(".addedResource").css('z-index','0')
        $(ele).css('z-index','1');
    });

    var $grpDD = $('.group_options');
    var $habDD = $('.habitat_options');
    //var $userGrpDD = $('.postToGrpsToggle')
    //var $userGrpBtn = $('.toggleGrpsDivWrapper')
    $(document.body).click(function(){
        if (!$grpDD.has(this).length || !$habDD.has(this).length  ) { // if the click was not within $div
            $grpDD.hide();
            $habDD.hide();
        }
        /*
           if(!$userGrpBtn.has(this).length && !$userGrpDD.has(this).length) {
           console.log("============IDHAR HAI===============");
           $userGrpDD.hide();
           }
        */
    });
}

$(".obvCreateTags").tagit({
    select:true, 
    allowSpaces:true, 
    placeholderText:'Add some tags',
    fieldName: 'tags', 
    autocomplete:{
        source: '/observation/tags'
    }, 
    triggerKeys:['enter', 'comma', 'tab'], 
    maxLength:30
});

$(".applyAll").click(function(){
    var me = this;
    var licenseVal = $(".propagateLicense").find("input").val();
    var dateVal = $(".propagateDate").find("input[name='fromDate']").val();
    var tagValues = []
    $('.propagateTags span.tagit-label').each(function(i){
        tagValues.push($(this).text()); // This is your rel value
    });
    var helpID = $(".propagateHelpID .helpID").is(':checked');
    var groups = getSelectedUserGroups($(".propagateGroups"));
    var latVal = $(".propagateLocation").find(".latitude_field").val();
    var longVal = $(".propagateLocation").find(".longitude_field").val();
    var spGrpVal = $(".propagateGrpHab").find("input[name='group_id']").val();
    var habVal = $(".propagateGrpHab").find("input[name='habitat_id']").val();
    var allForms = $(".addObservation");
    var locationpicker = $(".propagateLocation").find(".map_class").data('locationpicker'); 
    var placeName = $(".propagateLocation").find(".placeName").val();
    var wkt;
    if(locationpicker && locationpicker.mapLocationPicker.drawnItems) {
        var areas = locationpicker.mapLocationPicker.drawnItems.getLayers();
        if(areas.length > 0) {
            wkt = new Wkt.Wkt();
            wkt.fromObject(areas[0]);
        }
    }
    $.each(allForms, function(index,value){
        if(helpID) {
            $(value).find("input[name='help_identify']").trigger("click");    
        }
        $(value).find(".imageHolder li span:contains('"+licenseVal+"')").first().trigger("click");
        $(value).find('.fromDate').datepicker("setDate", dateVal);
        $.each(tagValues, function(index, tagVal){
            $(value).find(".obvCreateTags").tagit("createTag", tagVal);
        });
        $.each(groups, function(index, grpVal){
            var sel = ".userGroupsClass .checkbox button[value='"+grpVal+"']"
            $(value).find(sel).trigger("click");
        });
        $(value).find(".group_options li[value='"+spGrpVal+"']").trigger("click");
        $(value).find(".habitat_options li[value='"+habVal+"']").trigger("click");
        $(value).find(".latitude_field").val(latVal);
        $(value).find(".longitude_field").val(longVal);
        if(wkt) $(value).find("input.areas").val(wkt.write());
        $(value).find(".placeName").val(placeName);    
    });
});

function initializers(){
    $( ".date" ).datepicker({ 
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy' 
    });
    $(".addObservation .fromDate").val('');
    $(".obvCreateTags").tagit({
        select:true, 
        allowSpaces:true, 
        placeholderText:'Add some tags',
        fieldName: 'tags', 
        autocomplete:{
            source: '/observation/tags'
        }, 
        triggerKeys:['enter', 'comma', 'tab'], 
        maxLength:30
    });
    if($(".userGroupsSuperDiv").hasClass("span12")){
        $(".userGroupsSuperDiv").removeClass("span12");
        $(".userGroupsSuperDiv").addClass("span4");
    }
    $(".imageHolder").droppable({
        accept: ".addedResource.thumbnail",
        drop: function(event,ui){
            dropAction(event, ui , this);    
        }
    });
    $(".help-identify input").click(function(){
        console.log($(this).closest('.section').find('.nameContainer input'));
        if ($(this).is(':checked')){
            $(this).closest('.addObservation').find('.nameContainer input').val('');
            $(this).closest('.addObservation').find('.nameContainer input').attr('disabled', 'disabled');
        }else{
            $(this).closest('.addObservation').find('.nameContainer input').removeAttr('disabled');
        }
    });
    initializeLanguage();
    initializeNameSuggestion();
}