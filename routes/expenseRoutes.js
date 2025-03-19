  const express = require("express");
  const User = require('../models/userSchema')
  const Category = require('../models/categorySchema')
  const Expense = require("../models/expenseSchema");
  const { route } = require("./authRoutes");
  const router = express.Router();

  router.post("/expense", async (req, res) => {
    const { title, amount, category,description } = req.body;

    if (!title || !amount || !category || !description) {
      res.status(400).json({ error: "Please Fill All Fields" });
      return;
    }
    // Ensure amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid Amount" });
    }
    const expenseData = {
      title,
      amount: Number(amount), // Ensure amount is stored as a number
      category,
      description,
      user: req.user, // Make sure req.user exists
    };

    try {
      const expense = await Expense.create(expenseData);
      if (expense) {
        let status=''
        if(amount>5000){
          status = "Bdia paisaa udaya jara hai !"
        }else {
          status=`${amount} rupye ka chuna lag gya!!`
        }
        res.json({
          status: status,
          expenseId: expense._id,
        });
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  });


  // In your router
  router.get('/getCategories', async (req, res) => {
    try {
      const categories = await Category.find({});
      res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  router.get('/allExpenses', async (req, res) => {
    try {
      // Get current date
      const today = new Date();
      
      // Start of the current month (e.g., 2025-03-01 00:00:00)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // End of the current month (e.g., 2025-03-31 23:59:59)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      // Query expenses for the current user and current month
      const expenses = await Expense.find({
        user: req.user, // Assuming req.user is the authenticated  
        date: {
          $gte: startOfMonth, // Greater than or equal to start of month
          $lte: endOfMonth,   // Less than or equal to end of month
        },
      }).populate('category')
      .sort({ date: -1 }); // Sort by date in descending order
  
      if (!expenses.length) {
        return res.status(404).json({ message: 'No expenses found for this month!' });
      }
  
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses for the month:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  router.get('/expense/:id',async(req,res)=>{
    const expenseId = req.params.id;

    try {
      const expense = await Expense.findById(expenseId).populate('category').populate('user')
      console.log(expense.user._id.toString()===req.user)
      if(!expense || expense.user._id.toString()!==req.user){
        return res.status(404).json({message:"No Expense Found!"})
      }

      res.status(200).json(expense)
      
    } catch (error) {
      console.error("Getting error to get a expense ",error)  
      res.status(500).json({error:"Internal Server error"})
    }
  })



  router.put('/expense/:id',async(req,res)=>{
    const expenseId = req.params.id

    try {
      const updatedExpense = await Expense.findOneAndUpdate(
        {_id:expenseId,user:req.user},
        {$set:req.body},
        {new:true,runValidators:true}
      );

      if(!updatedExpense){
        return res.status(404).json({error:"Expense not found or user is unauthorized !"})
      }

      res.status(200).json({updatedExpense})
    } catch (error) {
      console.error("getting error to update expense",error)
      res.status(500).json({ error: "Internal Server Error" });
    }
  })



  router.delete('/expense/:id',async(req,res)=>{
    const expenseId = req.params.id
    try {
      const deleteExpense = await Expense.deleteOne(
        {_id:expenseId,user:req.user}
      )

      if(deleteExpense.deletedCount===0){
        res.status(404).json({message:"Expense not found or user is not authorized !"})
      }
      res.status(200).json({message:"Expense deleted successfully !"})
    } catch (error) {
        console.error("getting error to update expense",error)
        res.status(500).json({ error: "Internal Server Error" });
    }
  })




  router.get('/history',async(req,res)=>{
    const {start,end} = req.query;

    if(!start || !end){
      res.status(400).json({ error: "Please Fill All Fields" });
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
      // Return 400 error
      res.status(400).json({ error: "Start date should be less than End date! " });
      return;
    }
    console.log(req.user)
    console.log(startDate,endDate)
    try {
      const expenses = await Expense.find({
        user: req.user, // Assuming authentication middleware sets req.user
        date: { $gte: startDate, $lte: endDate },
      })
        .populate('category', 'name')
        .populate('user', 'userName')
        .sort({ date: -1 });
  
      // Send response
      res.status(200).json(expenses); 
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Server error' });
    }
  })





  module.exports = router;
