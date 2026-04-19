from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.forms import modelformset_factory
from .models import QuizModel, QuestionModel, ChoiceModel,ParticipationModel
from userprofile.models import UserAchievementModel
from django.db import transaction


# Create your views here.
@login_required
def create_quiz_view(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        image = request.FILES.get('image')

        if title and description and image:
            quiz = QuizModel.objects.create(
                author=request.user,
                title=title,
                description=description,
                quiz_picture=image
            )
            return redirect('add_question', quiz_id=quiz.id)
    return render(request, 'create_quiz.html')



def add_question_view(request, quiz_id):
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    error_message = None

    if request.method == 'POST':
        question_text = request.POST.get('question_text')

        if question_text:
            question = QuestionModel.objects.create(
                quiz=quiz,
                text=question_text
            )
            return redirect('add_choices', question_id=question.id)
        else:
            error_message = "Question text is required."

    return render (request, 'add_question.html', context={'quiz': quiz})


def add_choices_view(request, question_id):
    question = get_object_or_404(QuestionModel, id=question_id)
    error_message = None

    if request.method == 'POST':
        choice_texts = request.POST.getlist('choice_text')
        correct_choice_id = request.POST.get('correct_choice')

        if all(choice_texts) and correct_choice_id is not None:
            try:
                with transaction.atomic():
                    choices = []
                    for idx, choice_text in enumerate(choice_texts):
                        is_correct = (str(idx) == correct_choice_id)
                        choice = ChoiceModel(
                            question=question,
                            text=choice_text,
                            is_correct=is_correct
                        )
                        choices.append(choice)

                    ChoiceModel.objects.bulk_create(choices)

                    # Update the number of questions
                    question.quiz.no_of_questions = question.quiz.QuestionModel_quiz.count()
                    question.quiz.save()

                    if 'add_question' in request.POST:
                        return redirect('add_question', quiz_id=question.quiz.id)
                    else:
                        return redirect('quiz_detail', quiz_id=question.quiz.id)
            except Exception as e:
                error_message = f"An error occurred: {str(e)}"
        else:
            error_message = "Please provide all choice texts and select a correct choice."

    return render(request, 'add_choices.html', context={'question': question, 'error_message': error_message})




@login_required
def participate_in_quiz_view(request, quiz_id):
    quiz = get_object_or_404(QuizModel, id=quiz_id)

    if request.method == 'POST':
        score = 0
        for question in quiz.QuestionModel_quiz.all():
            selected_choice_id = request.POST.get(f'question_{question.id}')
            if selected_choice_id:
                try:
                    choice = ChoiceModel.objects.get(id=selected_choice_id)
                    if choice.is_correct:
                        score += 1
                except ChoiceModel.DoesNotExist:
                    pass

        ParticipationModel.objects.create(user=request.user, quiz=quiz, score=score)

        user_achievement, created = UserAchievementModel.objects.get_or_create( user=request.user)
        user_achievement.correct_answers += score
        user_achievement.save()
        return redirect('quiz_result', quiz_id=quiz.id)

    return render(request, 'participate.html', context={'quiz': quiz})


def quiz_detail_view(request, quiz_id):
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    return render(request, 'quiz_detail.html', {'quiz': quiz})


def quiz_result_view(request, quiz_id):
    quiz = get_object_or_404(QuizModel, id=quiz_id)
    participation = ParticipationModel.objects.filter(user=request.user, quiz=quiz).first() 

    leaderboard = ParticipationModel.objects.filter(quiz=quiz).order_by('-score')

    return render(request, 'quiz_result.html', context={'quiz': quiz,'participation': participation,'leaderboard': leaderboard, })

     
# def add_choices_view(request, question_id):
#     question = get_object_or_404(QuestionModel, id=question_id)
#     error_message = None

#     if request.method == 'POST':
#         choice_texts = request.POST.getlist('choice_text')
#         correct_choice_id = request.POST.get('correct_choice')

#         if all(choice_texts) and correct_choice_id is not None:
#             choices = []
#             for idx, choice_text in enumerate(choice_texts):
#                 is_correct = (str(idx) == correct_choice_id)
#                 choice = ChoiceModel(
#                     question=question,
#                     text=choice_text,
#                     is_correct=is_correct
#                 )
#                 choices.append(choice)

#             ChoiceModel.objects.bulk_create(choices)

#             if 'add_question' in request.POST:
#                 return redirect('add_question', quiz_id=question.quiz.id)
#             else:
#                 question.quiz.no_of_questions = question.quiz.QuestionModel_quiz.count()
#                 question.quiz.save()
#                 return redirect('quiz_detail', quiz_id=question.quiz.id)

#     return render(request, 'add_choices.html', context={'question': question})