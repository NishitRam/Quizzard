from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

class QuizModel(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="QuizModel_user",null=True)
    quiz_picture = models.ImageField(upload_to="quiz_pictures/",default='/media/user.png',null=True, blank=True)
    description = models.TextField(null=True,blank=True)
    no_of_questions= models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class QuestionModel(models.Model):
    quiz = models.ForeignKey(QuizModel, on_delete=models.CASCADE, related_name='QuestionModel_quiz')
    text = models.TextField()

class ChoiceModel(models.Model):
    question = models.ForeignKey(QuestionModel, on_delete=models.CASCADE, related_name='ChoiceModel_question')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

class ParticipationModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='ParticipationModel_user')
    quiz = models.ForeignKey(QuizModel, on_delete=models.CASCADE,related_name='ParticipationModel_quiz')
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)
