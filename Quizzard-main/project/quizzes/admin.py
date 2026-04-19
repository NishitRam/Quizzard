from django.contrib import admin
from .models import QuizModel,QuestionModel,ChoiceModel,ParticipationModel

# Register your models here.

admin.site.register(QuizModel)
admin.site.register(QuestionModel)
admin.site.register(ChoiceModel)
admin.site.register(ParticipationModel)