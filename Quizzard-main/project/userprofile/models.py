from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

class UserProfileModel(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE, related_name="UserProfileModel_user",null=True)
    profile_picture = models.ImageField(upload_to="profile_pictures/",null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True,editable=False)

    def has_profile_pic(self):
        return bool(self.profile_picture and hasattr(self.profile_picture,'url'))

class UserAchievementModel(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='UserAchievementModel_user',null=True)
    correct_answers = models.IntegerField(default=0)
    description = models.CharField(max_length=255,null=True, blank=True)
    date_achieved = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)