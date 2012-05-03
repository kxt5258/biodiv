<%@page import="species.auth.SUser"%>
<%@ page import="species.participation.Observation"%>
<%@ page import="species.groups.SpeciesGroup"%>
<%@ page import="species.Habitat"%>
<g:javascript>
	function setDefaultGroup(){
		var defId = "#group_" + "${SpeciesGroup.findByName(grailsApplication.config.speciesPortal.group.ALL).id}"
		$(defId).click();
	}
	function setDefaultHabitat(){
		var defId = "#habitat_" + "${Habitat.findByName(grailsApplication.config.speciesPortal.group.ALL).id}"
		$(defId).click();
	}
</g:javascript>

<div class="info-message" id="info-message">
	<span class="name" style="color: #b1b1b1;"> <i
		class="icon-screenshot"></i> ${observationInstanceTotal}
	</span> Observation<g:if test="${observationInstanceTotal>1}">s</g:if>
	<g:if test="${queryParams.groupId && SpeciesGroup.get(queryParams.groupId)}">
                                    of <span class="highlight"> <g:link
				controller="observation" action="list"
				params="[sGroup: queryParams.groupId]">
				${SpeciesGroup.get(queryParams.groupId).name} <a
				href="#" onclick="setDefaultGroup(); return false;">[X]</a></g:link>
		</span> group
                            </g:if>
	<g:if test="${queryParams.habitat && Habitat.get(queryParams.habitat)}">
                                    in <span class="highlight"><g:link
				controller="observation" action="list"
				params="[habitat: queryParams.habitat]">
				${Habitat.get(queryParams.habitat).name} <a
				href="#" onclick="setDefaultHabitat(); return false;">[X]</a></g:link> </span> habitat
                            </g:if>
	<g:if test="${queryParams.tag}">
                                    tagged <span class="highlight">
			<g:link controller="observation" action="list"
				params="[tag: queryParams.tag]">
				${queryParams.tag} <a id="removeTagFilter" href="#" >[X]</a></g:link>
		</span>
	</g:if>
	<g:if test="${queryParams.user && SUser.read(queryParams.user)}">
                                    by user <span class="highlight">
			<g:link controller="SUser" action="show" id="${queryParams.user}">
				${SUser.read(queryParams.user).name.encodeAsHTML()} <a
				id="removeUserFilter" href="#">[X]</a></g:link>
		</span>
	</g:if>
</div>