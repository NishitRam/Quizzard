from django.urls import path
from .views import create_quiz_view,add_question_view,add_choices_view,quiz_detail_view,participate_in_quiz_view,quiz_result_view

urlpatterns = [
    path('create/',create_quiz_view, name='create_quiz'),
    path('quiz/<int:quiz_id>/add-question/',add_question_view, name='add_question'),
    path('question/<int:question_id>/add-choices/',add_choices_view, name='add_choices'),
    path('quiz/<int:quiz_id>/', quiz_detail_view, name='quiz_detail'),
    path('quiz/<int:quiz_id>/participate/', participate_in_quiz_view, name='participate_in_quiz'),
    path('quiz/<int:quiz_id>/result/', quiz_result_view, name='quiz_result'),
]
