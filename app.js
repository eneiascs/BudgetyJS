
var modelModule = (function(){
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;   
        this.percentage = -1;
    }
    Expense.prototype.calculatePercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round(100 * (this.value / totalIncome));
        } else {
            this.percentage = -1;
        }    
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;   
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    },
    calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum +=curr.value;
        });
        data.totals[type] = sum;
    }
    return {
        addItem: function(type, des, value){
            var newItem, ID;
            
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id +1;
                
            }  else{
                ID = 0;
            }  
            if(type === 'exp'){
                newItem = new Expense(ID,des,value);
            }else if(type === 'inc'){
                newItem = new Expense(ID,des,value);
            }
            data.allItems[type].push(newItem);
            return newItem;
            
        },
        deleteItem: function(type, ID){
            var ids, index;
            ids = data.allItems[type].map(function(elem){
                return elem.id;
            });

            index = ids.indexOf(ID);

            if(index !==-1){
                data.allItems[type].splice(index,1);
            }

        },
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            }else{
                data.percentage = -1;
            }    
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentage(data.totals.inc);
            });
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.percentage;
            });
            return allPerc;
        },
        testing : function(){
            console.log(data);
        }
    }
})();




var viewModule = (function(){
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type) {
        var numSplit, int;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length -3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + int + '.' + dec;


    }
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    return {
        displayMonth: function(){
            var now, year, month, year;

            months = [];

            now = new Date();

            year = now.getFullYear();
            
            month = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = (month + 1) + '/' + year;
        },
        getDOMStrings : function(){
            return DOMStrings;
        },
        getInput : function(){
            return{
                type : document.querySelector(DOMStrings.inputType).value, //inc or exp
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)    
            }    
        },

        addListItem: function(obj,type){
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-${id}"><div class="item__description">${description}</div><div class="right clearfix"><div class="item__value">${value}</div><div class="item__delete">                   <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>       </div>'
            }else if(type === 'exp'){    
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-${id}"><div class="item__description">${description}</div>          <div class="right clearfix"><div class="item__value">${value}</div>                <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('${id}',obj.id);
            newHtml = newHtml.replace('${description}',obj.description);
            newHtml = newHtml.replace('${value}',formatNumber(obj.value,type));

            //Insert the HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem: function(itemID){
            var element = document.getElementById(itemID);
            element.parentNode.removeChild(element);
        },
        clearFields: function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(elem, index, array) {
                elem.value = '';
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            var type = obj.budget < 0 ? 'exp' : 'inc';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
           

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
               
            });
        },
        changeType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' +
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputValue
                );
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
        

    }
})();

var controller = (function (model,view){
    var setupEventListeners = function(){
        document.querySelector(view.getDOMStrings().inputBtn).addEventListener('click',addItemController);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                addItemController()
            }
            
        });

        document.querySelector(view.getDOMStrings().container).addEventListener('click',deleteItemController);
    
        document.querySelector(view.getDOMStrings().inputType).addEventListener('change', view.changeType);

    }
  
    var updateBudget = function(){
        // 1. Calculate the budget
        model.calculateBudget();

        // 2. Return the budget
        var budget = model.getBudget();

        // 3. Display the budget on the UI
        view.displayBudget(budget);
    }

    var updatePercentages = function(){
        //1. Calculate percentages
        model.calculatePercentages();
        //2. Read percentages from model
        var percentages = model.getPercentages();
        //3. Update the UI with the new percentages
        
        view.displayPercentages(percentages);
    }

    function addItemController(){
        var input, newItem;
        
        // 1. Get the field input data
        input = view.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){

        
            // 2. Add the item to budget controller
            newItem = model.addItem(input.type,input.description,input.value);
            // 3. Add the item to the UI
            view.addListItem(newItem,input.type);
       
            // 4. Clear the fields
       
            view.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            updatePercentages();
        }
    }
    var deleteItemController = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. delete the item from the data structure
            model.deleteItem(type,ID);

            //2. Delete the item from the UI
            view.deleteListItem(itemID);
            //3. Update and show the new budget
            
            updateBudget();

            updatePercentages();
        }

    }
    return {
        init: function(){
            updateBudget();
            setupEventListeners();
            view.displayMonth();
            console.log('Application has started');
        }
    }    

})(modelModule,viewModule);

controller.init();
