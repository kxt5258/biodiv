package species

import grails.converters.JSON;

import org.apache.solr.common.SolrException;
import org.apache.solr.common.util.NamedList

import species.utils.Utils;


/**
 * 
 * @author sravanthi
 *
 */
class SearchController {

    static allowedMethods = [save: "POST", update: "POST", delete: "POST"]

    def namesIndexerService;
    def biodivSearchService;
    def grailsApplication;
    def utilsService;
    static defaultAction = "select"

    def select () {
        def searchFieldsConfig = grailsApplication.config.speciesPortal.searchFields

        def model = biodivSearchService.select(params);
        model['userLanguage'] = utilsService.getCurrentLanguage(request); 

        if(params.loadMore?.toBoolean()){
            params.remove('isGalleryUpdate');
            render(template:"/search/showSearchResultsListTemplate", model:model);
            return;
        } else if(request.getHeader('X-Auth-Token') || params.resultType?.equalsIgnoreCase("json")) {
            render model as JSON
        } else if(!params.isGalleryUpdate?.toBoolean()){
            params.remove('isGalleryUpdate');
            render (view:"select", model:model)
            return;
        } else {
            params.remove('isGalleryUpdate');
            model['resultType'] = 'search result'
            def listHtml =  g.render(template:"/search/showSearchResultsListTemplate", model:model);
            def filterMsgHtml = g.render(template:"/common/observation/showObservationFilterMsgTemplate", model:model);

            listHtml = listHtml.replaceAll(/\n|\t|\s+/,' ');
            def filterPanel = g.render(template:"/search/sidebar", model:[modules:model.objectTypes, sGroups:model.sGroups, tags:model.tags, contributors:model.contributors]);
            def result = [obvListHtml:listHtml, obvFilterMsgHtml:filterMsgHtml, filterPanel:filterPanel,  instanceTotal:model.instanceTotal]
            render result as JSON
            return;
        }
        return;
    }

    /**
     *
     */
    def nameTerms()  {
        params.field = params.field?:"autocomplete";
        params.max = Math.min(params.max ? params.int('max') : 5, 10)
        List suggestions = new ArrayList();
        def namesLookupResults = namesIndexerService.suggest(params);

        suggestions.addAll(namesLookupResults);
        suggestions.addAll(biodivSearchService.nameTerms(params));
        render suggestions as JSON 
    }

    def search() {
        NamedList paramsList = new NamedList()
        params.each {key,value ->
            paramsList.add(key, value);
        }
        def result = biodivSearchService.search(paramsList)

        println result;
        println "++++++++++++++++++++++++++++++++++++++++++"
/*        def facetResults = [];
        if(result.getFacetField(params['facet.field'])) {
        List objectTypeFacets = result.getFacetField(params['facet.field'])?.getValues()
        if(objectTypeFacets) {
        objectTypeFacets.each {
            //TODO: sort on name
            facetResults <<  [name:it.getName(), count:it.getCount()]

        }
        }
        }
*/
        render result as JSON
    }

}
