var Sequelize = require('sequelize');

var sequelize = new Sequelize('sequelize_test', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
});

var User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
});

var Widget = sequelize.define('Widget', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
}, {
  hooks: {
    beforeValidate: function (widget, options) {
      if (!options.userId) {
        return Sequelize.Promise.reject(new Error('userId required in options for create or update'));
      }

      console.log(widget.changed());

      if (!widget.createdById) {
        widget.createdById = options.userId;
      }

      if (widget.changed()) {
        widget.updatedById = options.userId;
      }

      return widget;
    }
  }
});

Widget.belongsTo(User, { as: 'createdBy', foreignKey: { allowNull: false } });
Widget.belongsTo(User, { as: 'updatedBy', foreignKey: { allowNull: false } });

sequelize.sync({ force: true })
.then(function () {
  return User.create({
    name: 'John Doe',
  });
}).bind({})
.then(function (user1) {
  console.log(user1.get());
  this.user1 = user1;

  return User.create({
    name: 'Jane Doe',
  });
})
.then(function (user2) {
  console.log(user2.get());
  this.user2 = user2;

  return Widget.create({
    name: 'blue horse',
  }, {
    userId: this.user1.id,
  });
})
.then(function (widget) {
  console.log(widget.get());
  return widget.update({
    name: 'red horse',
  }, {
    userId: this.user2.id,
  });
})
.then(function (widget) {
  console.log(widget.get());
  return widget.reload();
})
.then(function (widget) {
  console.log('Widget updatedById SHOULD be 2 here:');
  console.log(widget.get());
})
.catch(function (err) {
  console.log('ERROR:', err);
});
