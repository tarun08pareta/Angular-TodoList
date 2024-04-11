import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  FormControl,
  Validators,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // Don't include RouterOutlet in the imports array
})
export class AppComponent implements OnInit {
  currentDate: Date = new Date();
  // NewTask: string = "";
  tasks: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
    minDate: string;
  }[] = [];
  completedTasks: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
    minDate: string;
  }[] = [];

  minDate: string = '';

  ngOnInit(): void {
    const today = new Date();
    this.minDate = this.formatDate(today);
    this.loadData();
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  NewTaskForm = new FormGroup({
    NewTask: new FormControl('', [
      Validators.required,
      Validators.maxLength(15),
      
      Validators.pattern('^[a-zA-Z]+( [a-zA-Z]+)*$'),
    ]),
    taskOfDate: new FormControl('', [
      Validators.required,
      this.validateDueDate,
    ]),
  });

  
  
  validateDueDate(control: any): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();

    if (selectedDate < today) {
      return { invalidDate: true };
    }
    return null;
  }

  get NewTask() {
    return this.NewTaskForm.get('NewTask');
  }

  get taskOfDate() {
    return this.NewTaskForm.get('taskOfDate');
  }

  addTask() {
    // console.log(this.NewTaskForm.value);
    console.log(this.taskOfDate?.value);
    if (this.NewTaskForm.valid) {
      const newTaskValue = this.NewTaskForm.get('NewTask')?.value;
      const newTaskDate = this.NewTaskForm.get('taskOfDate')?.value;
      if (newTaskValue && newTaskDate) {
        const newTask = {
          name: newTaskValue,
          minDate: newTaskDate,
          completed: false,
          starred: false,
          editMode: false,
        };
        if (this.tasks) {
          this.tasks.push(newTask);
          this.saveLocalStorage();
          this.NewTaskForm.reset();
        }
      }
    }
  }

  completeTask(task: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
    minDate: string;
  }) {
    task.completed = !task.completed;
    if (task.completed) {
      this.completedTasks.push(task);
      this.tasks = this.tasks.filter((t) => t !== task);
    } else {
      this.tasks.push(task);
      this.completedTasks = this.completedTasks.filter((t) => t !== task);
    }
    this.saveLocalStorage();
  }

  toggleStar(task: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
  }) {
    task.starred = !task.starred;
    this.saveLocalStorage();
  }

  deleteTask(taskToDelete: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
  }) {
    this.tasks = this.tasks.filter((task) => task !== taskToDelete);
    this.completedTasks = this.completedTasks.filter(
      (task) => task !== taskToDelete
    );
    this.saveLocalStorage();
  }

  toggleEditMode(task: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
  }) {
    // task.editMode = true;
    this.NewTaskForm.get('NewTask')?.setValue(task.name);
  }

  updateTask(task: {
    name: string;
    completed: boolean;
    starred: boolean;
    editMode: boolean;
  }) {
    task.editMode = false;
    this.saveLocalStorage();
  }

  // ngOnInit(): void {
  //   this.loadData();
  // }

  loadData() {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem('tasks');
      const storedCompleteTasks = localStorage.getItem('completedTasks');
      if (storedTasks) {
        this.tasks = JSON.parse(storedTasks);
      }
      if (storedCompleteTasks) {
        this.completedTasks = JSON.parse(storedCompleteTasks);
      }
    }
  }

  saveLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('completedTasks', JSON.stringify(this.completedTasks));
  }
}
