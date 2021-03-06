var digest = function (scope) {
    if (scope && scope.$root && !scope.$root.$$phase) {
        scope.$digest();
    }
};

var app = angular.module('gdgapp',['ngRoute','ngAnimate', 'ui.bootstrap']).
                config(function($routeProvider,$locationProvider){
                    $locationProvider.html5Mode(true)
                    $routeProvider
                        .when('/attending',{
                            templateUrl:"views/attending.html",
                            controller:"attendingCtrl"
                        })
                        .when('/registration',{
                            templateUrl:"views/registration.html",
                            controller:"regCtrl"
                        })
                        .when('/speakers',{
                            templateUrl:"views/speakers.html",
                            controller:"speakersCtrl"
                        })
                        .when('/sessions',{
                            templateUrl:"views/sessions.html",
                            controller:"sessionsCtrl"
                        })
                        .when('/registration',{
                            templateUrl:"views/registration.html",
                            controller:"regCtrl"
                        })

                        .otherwise({
                            redirectTo:"/",
                            templateUrl:"views/home.html",
                            controller:"homeCtrl"
                        })
                });
            

app.controller('speakersCtrl',function($scope, $modal){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
   
    fetch('data/speakers.json')
    .then(res=>res.json())
    .then(data => {
        $scope.speakersData = data;
            digest($scope);
    });

    fetch('data/patners.json')
    .then(res=>res.json())
    .then(data => {
        $scope.patData = data;
            digest($scope);
    });

    $scope.open = function (sp) {
        var modalInstance = $modal.open({
            keyboard: false,
            windowClass: 'show',
            templateUrl: "views/popup/speakersPopup.html",
            controller: "SpeakersDetailPopupCtrl",
            resolve: {
                speaker: function () {
                    return sp;
                }
            }
        });
    }
});

app.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    }
}]);

app.controller('SpeakersDetailPopupCtrl', function ($scope, $modalInstance, speaker) {
    
    $scope.speaker = speaker;

    $scope.onClosePopup = function () {
        $modalInstance.close();
    };
});

app.controller('ScheduleDetailPopupCtrl', function ($scope, $modalInstance, schedule) {

    $scope.schedule = schedule;

    $scope.onClosePopup = function () {
        $modalInstance.close();
    };
});

app.controller('sessionsCtrl',function($scope, $modal, $sce){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    fetch('data/sessions.json')
        .then(res=>res.json())
        .then(data => {
            $scope.sessionsData = data;
            digest($scope);
        });

    fetch('data/speakers.json')
        .then(res=>res.json())
        .then(data => {
            $scope.speakersData = data;
            digest($scope);
        });

    fetch('data/patners.json')
        .then(res=>res.json())
        .then(data => {
            $scope.patData = data;
            digest($scope);
        });

    fetch('data/tracks.json')
        .then(res=>res.json())
        .then(data => {
            $scope.trackData = data;
            digest($scope);
        });

    $scope.varSessions = false;
    $scope.varSchedule = true;

    $scope.getScheduleEntry= function(trackId, sessionObjects) {
        if (sessionObjects && $scope.speakersData && $scope.sessionsData) {
            for (var i = 0; i < sessionObjects.length; i++) {
                var sessionObj = sessionObjects[i];
                if (sessionObj.track === trackId) {

                    if (sessionObj.session){
                        // already enriched
                        return sessionObj;
                    }
                    sessionObj.session = $scope.getSessionById(sessionObj.sessionId);
                    if (sessionObj.session.speakerIds){
                        sessionObj.speakers = [];
                        for (var j = 0; j < sessionObj.session.speakerIds.length; j++) {
                            var speakerId = sessionObj.session.speakerIds[j];
                            sessionObj.speakers.push($scope.getSpeakerById(speakerId));
                        }
                    }else {
                        sessionObj.speaker = $scope.getSpeakerById(sessionObj.session.speakerId);
                    }
                    return sessionObj;
                }
            }
        }
    };

    $scope.isSpanned= function(trackId, sessionObjects) {
        if (sessionObjects && $scope.speakersData && $scope.sessionsData) {
            for (var i = 0; i < sessionObjects.length; i++) {
                var sessionObj = sessionObjects[i];
                if (sessionObj.track === trackId) {
                    return sessionObj.spanned;
                }
            }
        }
        return false;
    };

    $scope.getSessionById = function(sessionId){
        for (var i = 0; i < $scope.sessionsData.length; i++) {
            var session = $scope.sessionsData[i];
            if (session.id === sessionId){
                return session;
            }
        }
    };

    $scope.getSpeakerById = function(speakerId){
        for (var i = 0; i < $scope.speakersData.length; i++) {
            var speaker = $scope.speakersData[i];
            if (speaker.id === speakerId){
                return speaker;
            }
        }
    };


        $scope.open = function (sp) {
            if (!sp){
                return;
            }
            if (event){
                event.preventDefault();
                event.stopPropagation();
            }
        var modalInstance = $modal.open({
            keyboard: false,
            windowClass: 'show',
            templateUrl: "views/popup/speakersPopup.html",
            controller: "SpeakersDetailPopupCtrl",
            resolve: {
                speaker: function () {
                    return sp;
                }
            }
        });
    };
    $scope.openSchedule = function (schedule) {
        if (!schedule){
            return;
        }
        if (event){
            event.preventDefault();
            event.stopPropagation();
        }
        var modalInstance = $modal.open({
            keyboard: false,
            windowClass: 'show',
            templateUrl: "views/popup/schedulePopup.html",
            controller: "ScheduleDetailPopupCtrl",
            resolve: {
                schedule: function () {
                    return schedule;
                }
            }
        });
    };
        $scope.showSession = function(){
        $scope.varSessions = true;
        $scope.varSchedule = false;

        angular.element(document.querySelector("#showSessionID")).addClass("active-bar");

        angular.element(document.querySelector("#showSessionID")).removeClass("inactive-bar");

        angular.element(document.querySelector("#showScheduleID")).removeClass("active-bar");

        angular.element(document.querySelector("#showScheduleID")).addClass("inactive-bar");
    }

    $scope.showSchedule = function(){
        $scope.varSessions = false;
        $scope.varSchedule = true;

        angular.element(document.querySelector("#showScheduleID")).addClass("active-bar");

        angular.element(document.querySelector("#showScheduleID")).removeClass("inactive-bar");

        angular.element(document.querySelector("#showSessionID")).removeClass("active-bar");

        angular.element(document.querySelector("#showSessionID")).addClass("inactive-bar");
    }

})

app.controller('homeCtrl',function($scope){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    fetch('data/home.json')
    .then(res=>res.json())
    .then(data => {
        $scope.homeJson = data;
            digest($scope);
    })

    fetch('data/sessions.json')
    .then(res=>res.json())
    .then(data => {
        $scope.sessionsData = data;
            digest($scope);
    })

    fetch('data/speakers.json')
    .then(res=>res.json())
    .then(data => {
        $scope.speakersData = data;
            digest($scope);
    })

    fetch('data/patners.json')
    .then(res=>res.json())
    .then(data => {
        $scope.patData = data;
            digest($scope);
    })

    fetch('data/themes.json')
        .then(res=>res.json())
        .then(data => {
            $scope.themesData = data;
                digest($scope);
        })
})

app.controller('regCtrl',function($scope,$http){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    fetch('data/patners.json')
    .then(res=>res.json())
    .then(data => {
        $scope.patData = data;
            digest($scope);
    })

    var reggJsonData = $http.get('data/registration.json');

    fetch('data/registration.json')
    .then(res=>res.json())
    .then(data => {
        $scope.regJson = data;
            digest($scope);
    })

    document.getElementById('UserDetails').style.display = "none";
    document.getElementById('confirmation').style.display = "none";
    document.getElementById('updateData').style.display = "none";
    document.getElementById('loginStatus').style.display = "block";
    
    //Google Sign In Provider
    var provider = new firebase.auth.GoogleAuthProvider();

    document.getElementById('loginWithGoogle').addEventListener('click', GoogleLogin);
    document.getElementById('regForm').addEventListener('submit',addData);

    function GoogleLogin(){
        firebase.auth().signInWithPopup(provider).then(function(result) {
            var token = result.credential.accessToken;
            var user = result.user;
            console.log(user);     
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;

            console.log(errorCode);
            console.log(errorMessage);
        });
    }

    function addData(a){
        if(email){
            a.preventDefault();

            var data = {
                firstComers : $scope.firstEventValue,
                email : email,
                name : $scope.FullName,
                org : $scope.companyName,
                jobTitle : $scope.jobTitle,
                contactNumber : $scope.contactNumber,
                github : $scope.github,
                Stackoverflow : $scope.Stackoverflow,
                LinkedIn : $scope.LinkedIn,
                spcode : $scope.spcode,
                projects : $scope.projects,
                why : $scope.why,
                city : $scope.city,
                agg1 : $scope.agg1,
                agg2 : $scope.agg2,
                timeStamp : Date()
            }

            firebase.database().ref('data/'+uid).set(data).then(()=>{
                alert("User SuccessFully Registered");
                document.getElementById('UserDetails').style.display = "none";
                //document.getElementById('UserInput').innerHTML="Thank you Filling this Form";
                document.getElementById('confirmation').style.display="block";

                $scope.FullName = '',
                $scope.companyName = '';
                $scope.jobTitle = '';
                $scope.contactNumber = '';
                $scope.github = '' ;
                $scope.Stackoverflow = '';
                $scope.LinkedIn = '';
                $scope.spcode = '';
                $scope.projects = '';
                $scope.why = '';
                $scope.city = '';
            })
        }

    }


    $scope.logoutUser = function(){
        // Logout Functions
        function logoutUser(){
            firebase.auth().signOut().then(function() {
                $scope.UserDetails = false;
                $scope.confirmation = false;
                $scope.updateData = false;
                $scope.postLogin = false;
                $scope.loginStatus = true;
            }).then(()=>{
                alert("User is Logged Out");
            }).catch(function(error) {
            // An error happened.
            });
        }
    }

    var email;
    var uid;

    // console.log(uid);
    // console.log(email);

    // OnAuthStateChanged
    firebase.auth().onAuthStateChanged(function(user) {
        console.log('OnStateChange Called');
        if (user) {
            console.log('User Existed');
            var displayName = user.displayName;
            email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            uid = user.uid;
            var providerData = user.providerData;

 
            $scope.userEmail = email;

            document.getElementById('postLogin').style.display = "block";
            document.getElementById('loginStatus').style.display = "none";

            document.getElementById('postLogin').innerHTML= `
                <p class="google-font">User is Loggged In with ${email}</p>

                <a id="logout" style="color:blue"><i class="fa fa-sign-out" aria-hidden="true"></i> Sign Out as a ${displayName}</a>
            `;
            

            document.getElementById('logout').addEventListener('click',logoutUser);

            function logoutUser(){
                firebase.auth().signOut().then(function() {
                    // Sign-out successful.
                    document.getElementById('logout').style.display="none";
                    document.getElementById('loginStatus').style.display="block";
                    document.getElementById('UserDetails').style.display="none";
                    document.getElementById('postLogin').style.display = "none";
                    document.getElementById('updateData').style.display="none";
                }).then(()=>{
                    alert("User is Logged Out");
                }).catch(function(error) {
                // An error happened.
                });
            }
                            
    
            firebase.database().ref('data/'+uid).once('value',(snap)=>{
                if(snap.val()){
                    document.getElementById('UserDetails').style.display="none";
                    document.getElementById('updateData').style.display = "block";
                }
                else{
                    document.getElementById('UserDetails').style.display="block";
                }
            })
          
        } else {
            document.getElementById('loginStatus').style.display = "block";
        }
    });

})

app.controller('attendingCtrl',function($scope,$http){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    var reggJsonData = $http.get('data/registration.json');

    fetch('data/registration.json')
    .then(res=>res.json())
    .then(data => {
        $scope.regJson = data;
            digest($scope);
    })

  fetch('data/patners.json')
     .then(res=>res.json())
     .then(data => {
         $scope.patData = data;
             digest($scope);
     })
})

app.controller('ctrlSchedule',function($scope,$http){
    var edata = $http.get('data/schedule.json');

    fetch('data/schedule.json')
    .then(res=>res.json())
    .then(data => {
        $scope.schData = data;
            digest($scope);
})

$scope.schData = edata;
})

app.controller('footerCtrl',function($scope){
    fetch('data/footer.json')
    .then(res=>res.json())
    .then(data => {
        $scope.footerData = data;
            digest($scope);
    })
})