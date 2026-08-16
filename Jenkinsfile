pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
    DOCKER_IMAGE = 'vault-health'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'unset NODE_ENV; npm ci --include=dev'
      }
    }

    stage('Test') {
      steps {
        sh 'npx vitest --version'
        sh 'npm test'
      }
    }

    stage('Build Application') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        withEnv([
          "VITE_SUPABASE_URL=${env.VITE_SUPABASE_URL}",
          "VITE_SUPABASE_PUBLISHABLE_KEY=${env.VITE_SUPABASE_PUBLISHABLE_KEY}"
        ]) {
          sh '''
            docker build \
              --build-arg VITE_SUPABASE_URL="${VITE_SUPABASE_URL}" \
              --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY}" \
              -t vault-health:${BUILD_NUMBER} .
            docker tag vault-health:${BUILD_NUMBER} vault-health:latest
          '''
        }
      }
    }

    stage('Stop Existing Container') {
      steps {
        sh '''
          docker rm -f vault-health >/dev/null 2>&1 || true
        '''
      }
    }

    stage('Deploy Container') {
      steps {
        sh '''
          docker run -d \
            --name vault-health \
            -p 8080:80 \
            vault-health:${BUILD_NUMBER}
        '''
      }
    }

    stage('Verify Deployment') {
      steps {
        sh '''
          sleep 10
          curl -fsS http://host.docker.internal:8080/ > /tmp/vault-health-root.html
          curl -fsS http://host.docker.internal:8080/login > /tmp/vault-health-login.html
          curl -fsS http://host.docker.internal:8080/app > /tmp/vault-health-app.html
        '''
      }
    }
  }
}
