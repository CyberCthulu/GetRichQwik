from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from app.models import User

def user_exists(form, field):
    # Checking if user exists based on email
    email = field.data
    user = User.query.filter(User.email == email).first()
    if user:
        raise ValidationError('Email address is already in use.')

def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user:
        raise ValidationError('Username is already in use.')

class SignUpForm(FlaskForm):
    first_name = StringField('first_name', validators=[DataRequired(message="First name is required")])
    last_name = StringField('last_name', validators=[DataRequired(message="Last name is required")])
    username = StringField('username', validators=[DataRequired(message="Username is required"), username_exists])
    email = StringField('email', validators=[DataRequired(message="Email is required"), Email(message="Invalid email address"), user_exists])
    password = PasswordField('password', validators=[DataRequired(message="Password is required")])
    confirm_password = PasswordField('confirm_password', validators=[DataRequired(message="Password confirmation is required"), EqualTo('password', message="Passwords must match")])
