from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Config:
   SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:Achu%40575@localhost/lms_db"
   SQLALCHEMY_TRACK_MODIFICATIONS = False