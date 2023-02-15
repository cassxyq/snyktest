pipeline {
    agent any
    parameters {
        booleanParam defaultValue: false, name: 'SnykTest'
    }

    stages {
        stage('Test') {
            when {expression{return params.SnykTest}}
            steps {
            echo 'Testing...'
            snykSecurity(
            snykInstallation: 'snyktest',
            snykTokenId: 'snykapitoken',
            failOnIssues: 'false',
            //organisation: '',
            // place other optional parameters here, for example:
            //additionalArguments: '--all-projects --detection-depth=<DEPTH>'
            )
            }
        }

    }
}