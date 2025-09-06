// Money Buddy - Daily Expense Manager JavaScript

class MoneyBuddy {
    constructor() {
        this.transactions = [];
        this.categories = {
            expense: ["Food", "Transportation", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Others"],
            income: ["Salary", "Freelance", "Business", "Investment", "Others"]
        };
        this.budgets = {
            "Food": 2000,
            "Transportation": 800,
            "Shopping": 1500,
            "Entertainment": 1000,
            "Bills": 3000,
            "Healthcare": 500,
            "Education": 1000,
            "Others": 1000
        };
        this.settings = {
            currency: "₹",
            dateFormat: "DD/MM/YYYY",
            theme: "light"
        };
        this.currentTransactionType = 'expense';
        this.currentPage = 'dashboard';
        this.charts = {};
        this.currentCategoryType = 'expense';
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing MoneyBuddy...');
        this.loadData();
        this.initializeSampleData();
        // Small delay to ensure DOM is fully ready
        setTimeout(() => {
            this.initializeEventListeners();
            this.renderDashboard();
            this.applyTheme();
            this.updateCategoryOptions();
        }, 100);
    }

    // Data Management
    loadData() {
        try {
            const savedTransactions = localStorage.getItem('moneyBuddy_transactions');
            const savedCategories = localStorage.getItem('moneyBuddy_categories');
            const savedBudgets = localStorage.getItem('moneyBuddy_budgets');
            const savedSettings = localStorage.getItem('moneyBuddy_settings');

            if (savedTransactions) this.transactions = JSON.parse(savedTransactions);
            if (savedCategories) this.categories = JSON.parse(savedCategories);
            if (savedBudgets) this.budgets = JSON.parse(savedBudgets);
            if (savedSettings) this.settings = JSON.parse(savedSettings);
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    saveData() {
        try {
            localStorage.setItem('moneyBuddy_transactions', JSON.stringify(this.transactions));
            localStorage.setItem('moneyBuddy_categories', JSON.stringify(this.categories));
            localStorage.setItem('moneyBuddy_budgets', JSON.stringify(this.budgets));
            localStorage.setItem('moneyBuddy_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    initializeSampleData() {
        if (this.transactions.length === 0) {
            const sampleTransactions = [
                {
                    id: this.generateId(),
                    type: "expense",
                    amount: 450.00,
                    category: "Food",
                    date: "2025-08-30",
                    description: "Grocery shopping",
                    paymentMethod: "Credit Card",
                    createdAt: new Date("2025-08-30T10:30:00Z").toISOString()
                },
                {
                    id: this.generateId(),
                    type: "income",
                    amount: 5000.00,
                    category: "Salary",
                    date: "2025-08-01",
                    description: "Monthly salary",
                    paymentMethod: "Bank Transfer",
                    createdAt: new Date("2025-08-01T09:00:00Z").toISOString()
                },
                {
                    id: this.generateId(),
                    type: "expense",
                    amount: 80.00,
                    category: "Transportation",
                    date: "2025-08-29",
                    description: "Uber ride to office",
                    paymentMethod: "Digital Wallet",
                    createdAt: new Date("2025-08-29T08:15:00Z").toISOString()
                },
                {
                    id: this.generateId(),
                    type: "expense",
                    amount: 1200.00,
                    category: "Bills",
                    date: "2025-08-15",
                    description: "Electricity bill",
                    paymentMethod: "Bank Transfer",
                    createdAt: new Date("2025-08-15T14:20:00Z").toISOString()
                },
                {
                    id: this.generateId(),
                    type: "expense",
                    amount: 350.00,
                    category: "Entertainment",
                    date: "2025-08-28",
                    description: "Movie and dinner",
                    paymentMethod: "Credit Card",
                    createdAt: new Date("2025-08-28T19:30:00Z").toISOString()
                }
            ];
            this.transactions = sampleTransactions;
            this.saveData();
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event Listeners
    initializeEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation - using event delegation to ensure it works
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.hasAttribute('data-page')) {
                e.preventDefault();
                e.stopPropagation();
                const page = navItem.getAttribute('data-page');
                console.log('Navigation clicked:', page);
                this.navigateToPage(page);
                return;
            }
            
            // FAB button
            if (e.target.closest('#fab')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('FAB clicked');
                this.navigateToPage('add-transaction');
                return;
            }
            
            // Theme toggle
            if (e.target.closest('#themeToggle')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Theme toggle clicked');
                this.toggleTheme();
                return;
            }
            
            // Modal close buttons
            if (e.target.closest('.modal-close')) {
                e.preventDefault();
                e.stopPropagation();
                this.closeModals();
                return;
            }
            
            // Transaction type toggles
            const toggleBtn = e.target.closest('.toggle-btn[data-type]');
            if (toggleBtn) {
                e.preventDefault();
                e.stopPropagation();
                const type = toggleBtn.getAttribute('data-type');
                console.log('Transaction type toggle:', type);
                this.setTransactionType(type);
                return;
            }
            
            // Category buttons
            if (e.target.closest('#addExpenseCategory')) {
                e.preventDefault();
                e.stopPropagation();
                this.openCategoryModal('expense');
                return;
            }
            
            if (e.target.closest('#addIncomeCategory')) {
                e.preventDefault();
                e.stopPropagation();
                this.openCategoryModal('income');
                return;
            }
            
            // Theme setting buttons
            if (e.target.closest('#lightTheme')) {
                e.preventDefault();
                e.stopPropagation();
                this.setTheme('light');
                return;
            }
            
            if (e.target.closest('#darkTheme')) {
                e.preventDefault();
                e.stopPropagation();
                this.setTheme('dark');
                return;
            }
            
            // Reset and export buttons
            if (e.target.closest('#resetData')) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    this.resetAllData();
                }
                return;
            }
            
            if (e.target.closest('#exportData')) {
                e.preventDefault();
                e.stopPropagation();
                this.exportData();
                return;
            }
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.toggle('open');
            });
        }

        // Form submissions
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Transaction form submitted');
                this.handleTransactionSubmit();
            });
        }

        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleCategorySubmit();
            });
        }

        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleBudgetSubmit();
            });
        }

        // Settings change handlers
        const currencySetting = document.getElementById('currencySetting');
        if (currencySetting) {
            currencySetting.addEventListener('change', (e) => {
                this.settings.currency = e.target.value;
                this.saveData();
                this.renderCurrentPage();
            });
        }

        // Filter handlers - use input/change events properly
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                e.stopPropagation();
                if (this.currentPage === 'history') {
                    this.renderTransactionHistory();
                }
            });
            
            // Prevent any click handlers that might interfere
            searchInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                e.stopPropagation();
                if (this.currentPage === 'history') {
                    this.renderTransactionHistory();
                }
            });
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                e.stopPropagation();
                if (this.currentPage === 'history') {
                    this.renderTransactionHistory();
                }
            });
        }

        // Set current date as default
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        console.log('Event listeners set up successfully');
    }

    // Navigation - Fixed to show correct pages
    navigateToPage(page) {
        console.log('Navigating to page:', page);
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log('Page activated:', page);
        } else {
            console.error('Page not found:', page);
        }

        // Close mobile menu
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }

        // Update current page and render content
        this.currentPage = page;
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        console.log('Rendering page:', this.currentPage);
        
        switch (this.currentPage) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'add-transaction':
                this.renderAddTransaction();
                break;
            case 'history':
                this.renderTransactionHistory();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'budgets':
                this.renderBudgets();
                break;
            case 'reports':
                this.renderReports();
                break;
            case 'settings':
                this.renderSettings();
                break;
            default:
                console.warn('Unknown page:', this.currentPage);
        }
    }

    // Dashboard
    renderDashboard() {
        console.log('Rendering dashboard...');
        
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentBalance = totalIncome - totalExpense;

        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpenseEl = document.getElementById('totalExpense');
        const currentBalanceEl = document.getElementById('currentBalance');

        if (totalIncomeEl) totalIncomeEl.textContent = this.formatCurrency(totalIncome);
        if (totalExpenseEl) totalExpenseEl.textContent = this.formatCurrency(totalExpense);
        if (currentBalanceEl) currentBalanceEl.textContent = this.formatCurrency(currentBalance);

        this.renderRecentTransactions();
        
        // Delay chart rendering to ensure canvas is ready
        setTimeout(() => this.renderExpenseChart(), 200);
    }

    renderRecentTransactions() {
        const recentTransactions = this.transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const container = document.getElementById('recentTransactions');
        if (!container) return;
        
        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No transactions yet</h3>
                    <p>Start by adding your first transaction</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-left">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description || transaction.category}</h4>
                        <p>${transaction.category} • ${transaction.paymentMethod}</p>
                    </div>
                </div>
                <div class="transaction-amount">
                    <p class="amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </p>
                    <p class="date">${this.formatDate(transaction.date)}</p>
                </div>
            </div>
        `).join('');
    }

    renderExpenseChart() {
        const canvas = document.getElementById('expenseChart');
        if (!canvas) {
            console.warn('Expense chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');

        if (this.charts.expense) {
            this.charts.expense.destroy();
        }

        const expenseData = this.getExpensesByCategory();
        
        if (Object.keys(expenseData).length === 0) {
            console.log('No expense data for chart');
            return;
        }

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];

        try {
            this.charts.expense = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(expenseData),
                    datasets: [{
                        data: Object.values(expenseData),
                        backgroundColor: colors.slice(0, Object.keys(expenseData).length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            console.log('Expense chart rendered successfully');
        } catch (e) {
            console.error('Error rendering expense chart:', e);
        }
    }

    // Add Transaction
    renderAddTransaction() {
        console.log('Rendering add transaction page...');
        this.updateCategoryOptions();
    }

    setTransactionType(type) {
        this.currentTransactionType = type;
        console.log('Transaction type set to:', type);
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn[data-type]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-type="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update category options
        this.updateCategoryOptions();
    }

    updateCategoryOptions() {
        const categorySelect = document.getElementById('category');
        if (!categorySelect) return;
        
        const categories = this.categories[this.currentTransactionType] || [];
        
        categorySelect.innerHTML = '<option value="">Select a category</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        console.log('Category options updated for:', this.currentTransactionType);
    }

    handleTransactionSubmit() {
        console.log('Handling transaction submit');
        
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        console.log('Form data:', { amount, category, date, description, paymentMethod });

        if (!amount || amount <= 0) {
            this.showMessage('Please enter a valid amount!', 'error');
            return;
        }
        
        if (!category) {
            this.showMessage('Please select a category!', 'error');
            return;
        }
        
        if (!date) {
            this.showMessage('Please select a date!', 'error');
            return;
        }
        
        if (!paymentMethod) {
            this.showMessage('Please select a payment method!', 'error');
            return;
        }

        const transaction = {
            id: this.generateId(),
            type: this.currentTransactionType,
            amount: amount,
            category: category,
            date: date,
            description: description || category,
            paymentMethod: paymentMethod,
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveData();
        
        console.log('Transaction added:', transaction);
        
        // Show success message
        this.showMessage('Transaction added successfully!', 'success');
        
        // Reset form
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
            document.getElementById('date').valueAsDate = new Date();
            this.updateCategoryOptions();
        }
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
            this.navigateToPage('dashboard');
        }, 1500);
    }

    // Transaction History
    renderTransactionHistory() {
        console.log('Rendering transaction history...');
        
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const typeFilterValue = typeFilter ? typeFilter.value : '';
        const categoryFilterValue = categoryFilter ? categoryFilter.value : '';

        let filteredTransactions = this.transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
                                transaction.category.toLowerCase().includes(searchTerm);
            const matchesType = !typeFilterValue || transaction.type === typeFilterValue;
            const matchesCategory = !categoryFilterValue || transaction.category === categoryFilterValue;
            
            return matchesSearch && matchesType && matchesCategory;
        });

        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        this.updateCategoryFilter();
        this.renderTransactionsList(filteredTransactions);
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;
        
        const allCategories = [...new Set(this.transactions.map(t => t.category))];
        
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    renderTransactionsList(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No transactions found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-left">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description || transaction.category}</h4>
                        <p>${transaction.category} • ${transaction.paymentMethod}</p>
                    </div>
                </div>
                <div class="transaction-amount">
                    <p class="amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </p>
                    <p class="date">${this.formatDate(transaction.date)}</p>
                </div>
            </div>
        `).join('');
    }

    // Categories
    renderCategories() {
        console.log('Rendering categories...');
        this.renderCategoryList('expense', 'expenseCategories');
        this.renderCategoryList('income', 'incomeCategories');
    }

    renderCategoryList(type, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const categories = this.categories[type] || [];

        container.innerHTML = categories.map(category => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <div class="category-actions">
                    <button onclick="app.deleteCategory('${type}', '${category}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    openCategoryModal(type) {
        this.currentCategoryType = type;
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.remove('hidden');
            const nameInput = document.getElementById('categoryName');
            if (nameInput) {
                nameInput.focus();
            }
        }
    }

    handleCategorySubmit() {
        const categoryName = document.getElementById('categoryName').value.trim();
        
        if (!categoryName) return;

        if (!this.categories[this.currentCategoryType].includes(categoryName)) {
            this.categories[this.currentCategoryType].push(categoryName);
            this.saveData();
            this.renderCategories();
            this.showMessage('Category added successfully!', 'success');
        } else {
            this.showMessage('Category already exists!', 'error');
        }

        this.closeModals();
    }

    deleteCategory(type, category) {
        // Check if category is used in transactions
        const isUsed = this.transactions.some(t => t.category === category);
        
        if (isUsed) {
            this.showMessage('Cannot delete category that has transactions!', 'error');
            return;
        }

        if (confirm(`Delete category "${category}"?`)) {
            this.categories[type] = this.categories[type].filter(c => c !== category);
            this.saveData();
            this.renderCategories();
            this.showMessage('Category deleted successfully!', 'success');
        }
    }

    // Budgets
    renderBudgets() {
        console.log('Rendering budgets...');
        const container = document.getElementById('budgetsList');
        if (!container) return;
        
        const expenseCategories = this.categories.expense || [];

        container.innerHTML = expenseCategories.map(category => {
            const budget = this.budgets[category] || 0;
            const spent = this.getSpentInCategory(category);
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const remaining = budget - spent;

            let progressClass = '';
            if (percentage >= 90) progressClass = 'danger';
            else if (percentage >= 75) progressClass = 'warning';

            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <span class="budget-category">${category}</span>
                        <button class="budget-edit" onclick="app.editBudget('${category}', ${budget})">
                            Edit Budget
                        </button>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="budget-info">
                            <span>Spent: ${this.formatCurrency(spent)}</span>
                            <span>Remaining: ${this.formatCurrency(remaining)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getSpentInCategory(category) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' && 
                       t.category === category &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }

    editBudget(category, currentAmount) {
        document.getElementById('budgetCategory').value = category;
        document.getElementById('budgetAmount').value = currentAmount;
        document.getElementById('budgetModal').classList.remove('hidden');
    }

    handleBudgetSubmit() {
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);

        this.budgets[category] = amount;
        this.saveData();
        this.renderBudgets();
        this.showMessage('Budget updated successfully!', 'success');
        this.closeModals();
    }

    // Reports
    renderReports() {
        console.log('Rendering reports...');
        setTimeout(() => {
            this.renderTrendsChart();
            this.renderCategoryChart();
        }, 200);
    }

    renderTrendsChart() {
        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        const monthlyData = this.getMonthlyTrends();

        try {
            this.charts.trends = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthlyData.labels,
                    datasets: [{
                        label: 'Income',
                        data: monthlyData.income,
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        fill: true
                    }, {
                        label: 'Expense',
                        data: monthlyData.expense,
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Error rendering trends chart:', e);
        }
    }

    renderCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        const categoryData = this.getExpensesByCategory();
        
        if (Object.keys(categoryData).length === 0) {
            return;
        }

        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];

        try {
            this.charts.category = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(categoryData),
                    datasets: [{
                        data: Object.values(categoryData),
                        backgroundColor: colors.slice(0, Object.keys(categoryData).length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Error rendering category chart:', e);
        }
    }

    getMonthlyTrends() {
        const months = [];
        const income = [];
        const expense = [];

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            const monthlyIncome = this.transactions
                .filter(t => t.type === 'income' && t.date.startsWith(monthYear))
                .reduce((sum, t) => sum + t.amount, 0);
            
            const monthlyExpense = this.transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(monthYear))
                .reduce((sum, t) => sum + t.amount, 0);
            
            income.push(monthlyIncome);
            expense.push(monthlyExpense);
        }

        return { labels: months, income, expense };
    }

    getExpensesByCategory() {
        const categoryData = {};
        
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
            });

        return categoryData;
    }

    // Settings
    renderSettings() {
        console.log('Rendering settings...');
        const currencySetting = document.getElementById('currencySetting');
        if (currencySetting) {
            currencySetting.value = this.settings.currency;
        }
        
        // Update theme buttons
        document.getElementById('lightTheme').classList.remove('active');
        document.getElementById('darkTheme').classList.remove('active');
        const activeThemeBtn = document.getElementById(`${this.settings.theme}Theme`);
        if (activeThemeBtn) {
            activeThemeBtn.classList.add('active');
        }
    }

    setTheme(theme) {
        console.log('Setting theme to:', theme);
        this.settings.theme = theme;
        this.saveData();
        this.applyTheme();
        this.renderSettings();
    }

    toggleTheme() {
        const newTheme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.settings.theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            
            if (this.settings.theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
        console.log('Theme applied:', this.settings.theme);
    }

    resetAllData() {
        localStorage.removeItem('moneyBuddy_transactions');
        localStorage.removeItem('moneyBuddy_categories');
        localStorage.removeItem('moneyBuddy_budgets');
        localStorage.removeItem('moneyBuddy_settings');
        
        location.reload();
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            categories: this.categories,
            budgets: this.budgets,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `money-buddy-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    // Utility Methods
    formatCurrency(amount) {
        return `${this.settings.currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    }

    showMessage(message, type = 'info') {
        console.log('Showing message:', message, type);
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `status status--${type}`;
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '80px';
        messageEl.style.right = '20px';
        messageEl.style.zIndex = '9999';
        messageEl.style.animation = 'fadeIn 0.3s ease';

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(messageEl)) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        // Reset forms
        const categoryForm = document.getElementById('categoryForm');
        const budgetForm = document.getElementById('budgetForm');
        
        if (categoryForm) categoryForm.reset();
        if (budgetForm) budgetForm.reset();
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new MoneyBuddy();
    });
} else {
    app = new MoneyBuddy();
}

// Add CSS for message animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(style);