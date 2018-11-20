
//Budget controller
let budgetController = (function () {
    
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    let data = {
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
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item
            if (type === 'exp') {
                newItem = new Expense (ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income (ID, des, val);
            }
            //Push it into our data srructure
            data.allItems[type].push(newItem);
            //Return new element
            return newItem;
        },

        calculateBudget: function() {

            //calcultae total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expences
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        testing: function() {
            console.log(data)
        }
    }

})();


//UI controller
let UIController = (function() {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expansesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenceLabel: '.budget__expenses--value',
        expencePercentage: '.budget__expenses--percentage',
        container: '.container'
    }
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat (document.querySelector(DOMstrings.inputValue).value)
            };            
        },

        addListItem: function (obj, type) {
            let html, newHtml,element;
            //Create HTML string with placeholder
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expansesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {

            }
            //Replace the placeholder
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            //Insert HTMO to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            let fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fields.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenceLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.expencePercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expencePercentage).textContent = '---';
            }
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();


//Global App controller
let сontroller = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
    
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    let updateBudget = function () {
        //1.Calculate budget
        budgetCtrl.calculateBudget();
        //2.return budget
        let budget = budgetCtrl.getBudget();
        //3.Display budget on UI
        UICtrl.displayBudget(budget);
    };

    let ctrlAddItem = function() {
        let input, newItem;

        //1.Get the filed input  data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2.Add the item the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            //3.Add the ite, to the UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear the fields
            UICtrl.clearFields();

            //5.Calculate and update budget
            updateBudget();
        };
    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            //1. Delete the item from data structure

            //2. Delete the item from the UI

            //3. Update and show the new budget

        }
    }

    return {
        intit: function() {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

сontroller.intit();