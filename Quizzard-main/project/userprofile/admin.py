from django.contrib import admin
from .models import UserProfileModel,UserAchievementModel

# Register your models here.
admin.site.register(UserProfileModel)
admin.site.register(UserAchievementModel)