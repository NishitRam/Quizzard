from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import UserProfileModel ,UserAchievementModel
from quizzes.models import QuizModel, ParticipationModel


# Home view
@login_required  
def home_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        if get_user_model().objects.filter(username=username).exists():
            return redirect('profile_view', username)
    quiz_data = QuizModel.objects.exclude(author=request.user)
    return render(request, 'home.html', context={"request": request, "user": request.user, "quizzes": quiz_data})


# Login view
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_instance = authenticate(username=username, password=password)
        if user_instance is not None:
            login(request, user_instance)
            return redirect('home_view')
        else:
            print("Invalid username or password")
            return redirect('login_view')
    return render(request, 'login.html')


# Signup view
def signup_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        password = request.POST.get('password')
        email = request.POST.get('email')

        if get_user_model().objects.filter(username=username).exists():
            print("Username already exists")
            return redirect('signup_view')

        user_instance = get_user_model().objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )
        UserProfileModel.objects.create(user=user_instance)
        UserAchievementModel.objects.create(user=user_instance)

        return redirect('login_view')
    return render(request, 'signup.html')




# Profile view
@login_required
def profile_view(request, username):
    user_instance = get_object_or_404(get_user_model(), username=username)
    is_user_profile = request.user.username == username

    user_achievement = UserAchievementModel.objects.filter(user=user_instance).first()
    
    quizzes_created = QuizModel.objects.filter(author=user_instance)
    quizzes_participated = ParticipationModel.objects.filter(user=user_instance)

    data = {
        "is_user_profile": is_user_profile,
        "quizzes_created_count": quizzes_created.count(),
        "quizzes_participated_count": quizzes_participated.count(),
        "correct_answers_count": user_achievement.correct_answers if user_achievement else 0,
        "achievement": user_achievement.description if user_achievement else "No achievements yet.",
        "user_created": quizzes_created,
        "user_participated": quizzes_participated,
    }

    return render(request, 'profile.html', context={"request": request, "user": user_instance, "data": data})


# Update user profile view
@login_required
def update_user_profile(request):
    user_instance = request.user
    if request.method == 'POST':
        user_instance.first_name = request.POST.get('first_name')
        user_instance.last_name = request.POST.get('last_name')
        new_username = request.POST.get('username')

        if new_username != request.user.username:
            if get_user_model().objects.filter(username=new_username).exists():
                print("Username already taken")
            else:
                user_instance.username = new_username

        user_profile_instance = user_instance.UserProfileModel_user
        user_profile_instance.bio = request.POST.get('bio')
        if 'profile_picture' in request.FILES:
            user_profile_instance.profile_picture = request.FILES['profile_picture']

        user_profile_instance.save()
        user_instance.save()
        return redirect('profile_view', username=user_instance.username)

    return render(request, 'update_user_profile.html', context={"request": request, "user": user_instance})


# Update password view
@login_required
def update_password_view(request):
    user_instance = request.user
    if request.method == 'POST':
        old_password = request.POST.get('password')
        new_password = request.POST.get('new_password')
        new_password_check = request.POST.get('new_password_check')

        if user_instance.check_password(old_password):
            if new_password == new_password_check:
                user_instance.set_password(new_password)
                user_instance.save()
                return redirect('profile_view', username=user_instance.username)
        print("Password update failed")
        return redirect('update_password_view')

    return render(request, 'update_password.html', context={"request": request, "user": user_instance})


# Delete profile view
@login_required
def delete_profile_view(request):
    request.user.delete()
    return redirect('login_view')

# Logout view
@login_required
def logout_view(request):
    logout(request)
    return redirect('login_view')