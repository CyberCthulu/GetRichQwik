from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from app.models import User

class SignUpForm(FlaskForm):
    first_name = StringField('first_name', validators=[DataRequired(message="First name is required")])
    last_name = StringField('last_name', validators=[DataRequired(message="Last name is required")])
    username = StringField('username', validators=[DataRequired(message="Username is required")])
    email = StringField('email', validators=[DataRequired(message="Email is required"), Email(message="Invalid email address")])
    password = PasswordField('password', validators=[DataRequired(message="Password is required")])
    confirm_password = PasswordField('confirm_password', validators=[
        DataRequired(message="Password confirmation is required"),
        EqualTo('password', message="Passwords must match")
    ])

    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError("Username is already in use.")

    def validate_email(self, field):
        if User.query.filter_by(email=field.data).first():
            raise ValidationError("Email is already in use.")
