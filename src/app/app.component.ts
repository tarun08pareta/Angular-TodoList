import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
// Import the Task interface
interface Task {
  name: string;
  completed: boolean;
  starred: boolean;
  editMode: boolean;
  minDate: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  currentDate: Date = new Date();
  mode: string = 'Add';
  editTask: Task | null = null;
  tasks: Task[] = [];
  completedTasks: Task[] = [];
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

      this.maxLengthWithoutWhitespace(15),
      Validators.pattern('\\s*[a-zA-Z]+(\\s*[a-zA-Z]+)*\\s*'),
    ]),
    taskOfDate: new FormControl('', [
      Validators.required,
      this.validateDueDate,
    ]),
  });

  maxLengthWithoutWhitespace(maxLength: number): ValidatorFn {
    return (control: any): { [key: string]: boolean } | null => {
      const value = control.value?.replace(/\s/g, ''); // Remove whitespace

      if (value.length > maxLength) {
        return { maxlength: true };
      }
      return null;
    };
  }

  validateDueDate(control: any): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // console.log(today)
    if (selectedDate >= today) {
      return null;
    }
    return { invalidDate: true };
  }

  get NewTask() {
    return this.NewTaskForm.get('NewTask');
  }

  get taskOfDate() {
    return this.NewTaskForm.get('taskOfDate');
  }

  addTask() {
    const newTaskValue = this.NewTaskForm.get('NewTask')?.value;
    const newTaskDate = this.NewTaskForm.get('taskOfDate')?.value;

    if (this.mode === 'Update') {
      const newTask: Task = {
        name: newTaskValue || '',
        minDate: newTaskDate || '',
        completed: this.editTask?.completed || false,
        starred: this.editTask?.starred || false,
        editMode: false,
      };

      if (
        this.editTask !== null &&
        newTask.name !== '' &&
        newTask.minDate !== ''
      ) {
        const findIndex = this.tasks.indexOf(this.editTask);
        const findIndexComplete = this.completedTasks.indexOf(this.editTask);
        if (newTask.completed == false) {
          this.tasks.splice(findIndex, 1, newTask);
        } else {
          this.completedTasks.splice(findIndexComplete, 1, newTask);
        }
      }
    } else {
      if (this.NewTaskForm.valid && newTaskValue && newTaskDate) {
        const newTask: Task = {
          name: newTaskValue,
          minDate: newTaskDate,
          completed: false,
          starred: false,
          editMode: false,
        };
        this.tasks.push(newTask);
        this.saveLocalStorage();
        this.NewTaskForm.reset();
      }
    }
    this.mode = 'Add';
    this.NewTaskForm.get('NewTask')?.setValue('');
    this.NewTaskForm.get('taskOfDate')?.setValue('');
  }

  completeTask(task: Task) {
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

  toggleStar(task: Task) {
    task.starred = !task.starred;
    this.saveLocalStorage();
  }

  deleteTask(taskToDelete: Task) {
    this.tasks = this.tasks.filter((task) => task !== taskToDelete);
    this.completedTasks = this.completedTasks.filter(
      (task) => task !== taskToDelete
    );
    this.saveLocalStorage();
  }

  toggleEditMode(task: Task) {
    this.mode = 'Update';
    this.editTask = task;
    this.NewTaskForm.get('NewTask')?.setValue(task.name);
    this.NewTaskForm.get('taskOfDate')?.setValue(task.minDate);
  }

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
