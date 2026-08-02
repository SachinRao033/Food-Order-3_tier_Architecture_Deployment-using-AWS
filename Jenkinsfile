pipeline {

    agent any

    environment {
        PROJECT_NAME = "food-ordering-3tier"
    }

    stages {

        stage('Checkout Source') {
            steps {
                echo "Checking out source code..."
                checkout scm
            }
        }

        stage('Verify Docker') {
            steps {
                sh 'sudo docker --version'
                sh 'sudo docker-compose version'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh '''
                sudo docker-compose down || true
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                sudo docker-compose build
                '''
            }
        }

        stage('Start Containers') {
            steps {
                sh '''
                sudo docker-compose up -d
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                sudo docker ps
                '''
            }
        }

    }

    post {

        success {

            echo "Deployment Successful"
            echo "http://13.206.120.60:81 --> Frontend"
            echo "http://13.206.120.60:5000 --> Backend"

        }

        failure {

            echo "Deployment Failed"

        }

        always {

            sh 'sudo docker ps -a'

        }

    }

}
