import species.participation.ChecklistService

def checklistService = ctx.getBean("checklistService");

checklistService.migrateChecklist()