Router.route('/', function () {
  this.render('Home', {
    data: function () { return Items.findOne({_id: this.params._id}); }
  });
});

Router.route('/settings', function () {
  this.render('PageOne', {
      data: function () { return Items.findOne({_id: this.params._id}); }
  });
});

Router.route('/contact', function () {
  this.render('PageTwo', {
      data: function () { return Items.findOne({_id: this.params._id}); }
  });
});

Router.route('/about', function () {
  this.render('PageTwo', {
      data: function () { return Items.findOne({_id: this.params._id}); }
  });
});

//Define items. 
Items = [{name: "speakers", cost: 150}, 
         {name: "a microphone", cost: 500}, 
         {name: "better software", cost: 1500}, 
         {name: "some samples", cost: 4000}, 
         {name: "a rapper", cost: 15000}];

if (Meteor.isClient) {
  //Switch logins to username
    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_ONLY'
    });
  //Subscribe to Meteor.users
    Meteor.subscribe('userData');

  //Export a list of all players (sorted by downloads), all things you can buy, and the current user to the template system
    Template.leaderboard.players = function () {
        return Meteor.users.find({}, {sort: {'downloads': -1}});
    };
    Template.leaderboard.items = function () {
        return Items;
    };
    Template.leaderboard.user = function () {
        return Meteor.user();
    };

  //Call click / buy functions on server when you click on the buttons
    Template.leaderboard.events({
        'click input.click': function () {
            Meteor.call('click');
        }
    });
    Template.leaderboard.events({
        'click input.reset': function () {
            Meteor.call('reset');
        }
    });
    Template.leaderboard.events({
        'click input.grammy': function () {
            Meteor.call('grammy');
        }
    });
    Template.leaderboard.events({
        'click input.colgrammy': function () {
            Meteor.call('colgrammy');
        }
    });
    Template.leaderboard.events({
        'click input.lilb': function () {
            Meteor.call('lilb');
        }
    });
    Template.leaderboard.events({
        'click input.schoolboy': function () {
            Meteor.call('schoolboy');
        }
    });
    Template.leaderboard.events({
        'click input.kanye': function () {
            Meteor.call('kanye');
        }
    });
    Template.leaderboard.events({
        'click input.buy': function (event) {
            Meteor.call('buy', event.target.id); //the 'id' of the button is the cost. So there aren't really items
        }
    });

  //Registering a helper function to Handlebars so we can format currency correctly. 
    Handlebars.registerHelper('formatCurrency', function (number) {
        return number.toLocaleString();
    });
}

if (Meteor.isServer) {
  //Construct user with no downloads & DPS
    Accounts.onCreateUser(function (options, user) {
        user.downloads = 0;
        user.rate = 0;
        user.grammy = 0;
        return user;
    });

  //Publish user data to the clients
    Meteor.publish("userData", function () {
        return Meteor.users.find({}, {sort: {'downloads': -1}});
    });

  //Update people's downloads every second. 
    Meteor.startup(function() {
        Meteor.setInterval(function() {
            Meteor.users.find({}).map(function(user) {
                Meteor.users.update({_id: user._id}, {$inc: {'downloads': user.rate}})
            });
        }, 1000)
    });
}

Meteor.methods({
    buy: function(amount) {
        if(Meteor.user().downloads >= amount && amount > 0) //check that people have enough downloads, and it's positive
      //Give people DPS at 1/50 DPS per $, rounded down. Subtract downloads
            Meteor.users.update({_id: this.userId}, {$inc: {'rate': (Math.floor(amount/10)), 'downloads': (0-amount)}}); 
    },
    reset: function() {
      //Reset downloads
        Meteor.users.update({_id: this.userId}, {$set: {'rate': 0, 'downloads': 0, 'grammy': 0}});    
    },
    grammy: function(amount) {
        //Doubles the download rate
        Meteor.users.find({}).map(function(user) {
            var number = (Math.round(user.rate*2));
            Meteor.users.update({_id: user._id}, {$set: {'rate': number}});
        });
    },
    colgrammy: function(amount) {
        //Gives the user a grammy if they have enough downloads and resets progress
            Meteor.users.update({_id: this.userId}, {$inc: {'grammy': 1}});
    },
    lilb: function() {
        //Increases the rate of downloads exponentially (1.1)
        Meteor.users.find({}).map(function(user) {
            var number = Math.round(Math.pow(user.rate, 1.1));
                Meteor.users.update({_id: user._id}, {$set: {'rate': number, 'downloads': 0}}, {$inc: {'grammy': -2}});  
        });
    },
    schoolboy: function() {
        //Increases the rate of downloads exponentially (1.5)
        Meteor.users.find({}).map(function(user) {
            var number = Math.round(Math.pow(user.rate, 1.5));
                Meteor.users.update({_id: user._id}, {$set: {'rate': number, 'downloads': 0}}, {$inc: {'grammy': -3}});  
        });
    },
    kanye: function() {
        //Increases the rate of downloads exponentially (2)
        Meteor.users.find({}).map(function(user) {
            var number = Math.round(Math.pow(user.rate, 2));
                Meteor.users.update({_id: user._id}, {$set: {'rate': number, 'downloads': 0}}, {$inc: {'grammy': -5}});  
        });
    },
    click: function () {
    //Give people $25 per click
        Meteor.users.update({_id: this.userId}, {$inc: {'downloads': 10}});
    },
})