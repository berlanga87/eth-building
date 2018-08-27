App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load units.
    // $.getJSON('../units.json', function(data) {
    //   var unitsRow = $('#unitsRow');
    //   var unitTemplate = $('#unitTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     unitTemplate.find('.panel-title').text(data[i].name);
    //     unitTemplate.find('img').attr('src', data[i].picture);
    //     unitTemplate.find('.unit-breed').text(data[i].breed);
    //     unitTemplate.find('.unit-age').text(data[i].age);
    //     unitTemplate.find('.unit-location').text(data[i].location);
    //     unitTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     unitsRow.append(unitTemplate.html());
    //   }
    // });

    var account = web3.eth.accounts[0];
    var accountInterval = setInterval(function() {
      if (web3.eth.accounts[0] !== account) {
        account = web3.eth.accounts[0];
        // loadUnits();
        document.location.reload();
      }
    }, 100);

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App3.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Building.json', function(data) {
      var BuildingArtifact = data;
      App.contracts.Building = TruffleContract(BuildingArtifact);

      App.contracts.Building.setProvider(App.web3Provider);

      return App.loadUnits()
    });

    return App.bindEvents();
  },

  loadUnits: function(){
    var buildingInstance;

    App.contracts.Building.deployed().then(function(instance) {
      buildingInstance = instance;

      return buildingInstance.getNumUnits.call();
    }).then(function(size) {
      
      var account;

      web3.eth.getAccounts(function(error, accounts){
        if (error) {
          console.log(error);
        }
        account = accounts[0];
      });

      var unitsRow = $('#unitsRow');
      unitsRow.empty();
      var unitTemplate = $('#unitTemplate');

      for (i = 0; i < size.toNumber(); i++) {
        buildingInstance.getUnit(i).then(function(data) {
          var unit_id = data[0].toNumber();
          var unit_price = web3.fromWei(data[1].toNumber(), 'ether');
          var unit_forsale = data[2];
          var unit_owner = data[3];
          var owner_length = unit_owner.length;
          var unit_owner_string = unit_owner.substr(0,4) + '...' + unit_owner.substr(owner_length-4)
        
          unitTemplate.find('.panel-title').text('Unit #' + unit_id);
          if (unit_forsale) {
            unitTemplate.find('.unit-price').text(unit_price + ' ETH');
          }

          else {
            unitTemplate.find('.unit-price').text('N/A'); 
          }
          
          unitTemplate.find('.unit-owner').text(unit_owner_string);
          unitTemplate.find('.btn-buy').attr('data-id', unit_id);
          unitTemplate.find('.btn-list').attr('data-id', unit_id);
          unitTemplate.find('.btn-unlist').attr('data-id', unit_id);

          unitsRow.append(unitTemplate.html());
          // console.log("unit #" + unit_id);
          // console.log("unit owner: " + unit_owner);
          // console.log("unit for sale: " + unit_forsale);
          // console.log("current account " + account);
          // var match = (account==unit_owner);
          // console.log("addresses match: " + match);

          // buy - hide if account is owner OR if not owner and not for sale)

          if ( account == unit_owner || (account != unit_owner && unit_forsale == false)){
            $('.panel-unit').eq(unit_id).find('.btn-buy').prop('disabled', true);  
          } 

          // list - hide if account is not owner OR is owner and unit is already for sale
          
          if ( account != unit_owner || account == unit_owner && unit_forsale == true){
            $('.panel-unit').eq(unit_id).find('.btn-list').prop('disabled', true);
          }

          // unlist - hide if

          if ( account != unit_owner || account == unit_owner && unit_forsale == false){
            $('.panel-unit').eq(unit_id).find('.btn-unlist').prop('disabled', true);
          }        

        });
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleSale);
    $(document).on('click', '.btn-list', App.handleListing);
    $(document).on('click', '.btn-unlist', App.handleUnlisting);
  },

  markListed: function(result, price){
    console.log('triggered markListed: ' + result)
    $('.panel-unit').eq(result).find('.btn-list').prop('disabled', true);
    $('.panel-unit').eq(result).find('.btn-unlist').prop('disabled', false);
    $('.panel-unit').eq(result).find('.unit-price').text(price + ' ETH');
  },

  markUnlisted: function(result){
    console.log('triggered markUnlisted: ' + result)
    $('.panel-unit').eq(result).find('.btn-list').prop('disabled', false);
    $('.panel-unit').eq(result).find('.btn-unlist').prop('disabled', true);
    $('.panel-unit').eq(result).find('.unit-price').text('N/A');
  },

  markSold: function(result) {
    console.log('triggered markSold: ' + result);
    document.location.reload();
    
    
  },

  handleListing: function(event) {
    event.preventDefault();

    var unitId = parseInt($(event.target).data('id'));
    var price = Math.round(Number(window.prompt("Enter a sale price in ETH (decimals will be rounded)"),0));
    
    console.log('unit_id: '+ unitId);
    console.log('price: '+ price);
    console.log('typeof(price): '+ typeof(price));

    if (!price || isNaN(price) || price == 0) {
      alert('Please enter a valid price in Ether');      
      return;
    }

    var buildingInstance;

    web3.eth.getAccounts(function(error, accounts){
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Building.deployed().then(function(instance) {
        buildingInstance = instance;
        buildingInstance.list(unitId, price, {from: account}).then(function(result){
          console.log('listing result: ' + result);
          App.markListed(unitId, price);
        }).catch(function(err){
          console.log(err.message);
        });
      });
    });


  },

  handleUnlisting: function(event) {
    event.preventDefault();

    var unitId = parseInt($(event.target).data('id'));
    console.log(unitId)

    var buildingInstance;
    var account;

    web3.eth.getAccounts(function(error, accounts){
      if (error) {
        console.log(error);
      }

      account = accounts[0];

      App.contracts.Building.deployed().then(function(instance) {
        console.log('account: ' + account)
        buildingInstance = instance;
        buildingInstance.unlist(unitId, {from: account}).then(function(result){
          console.log('unlist done for ' + result);
          var x = result;
          App.markUnlisted(unitId);
        }).catch(function(err){
          console.log(err.message);
        });
      });
    });


  },

  handleSale: function(event) {
    event.preventDefault();

    var unitId = parseInt($(event.target).data('id'));
    console.log(unitId)

    var buildingInstance;
    var account;

    web3.eth.getAccounts(function(error, accounts){
      if (error) {
        console.log(error);
      }

      account = accounts[0];

      App.contracts.Building.deployed().then(function(instance) {
        console.log('account: ' + account)
        buildingInstance = instance;
        buildingInstance.getPrice.call(unitId).then(function(price){
          console.log('sale price: ' + price)
          return buildingInstance.buy(unitId, {from: account, gas:"3000000", value: price});
        }).then(function(result){
          App.markSold(unitId);
        }).catch(console.log);
          // }).then(function(result) {
        //   return App.markSold();
        // }).catch(function(err){
        //   console.log(err.message);
        // });
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
