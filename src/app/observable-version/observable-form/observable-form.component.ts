import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, filter, map, Observable, startWith, Subject, switchMap, takeUntil} from 'rxjs';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../model/user';
import {UserService} from '../../service/userService';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-observable-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,
    NgForOf
  ],
  templateUrl: './observable-form.component.html',
  styleUrl: './observable-form.component.css'
})
export class ObservableFormComponent implements OnInit, OnDestroy{

  private destroy$ = new Subject<void>();
  private userService = inject(UserService);

  protected userForm: FormGroup;

  protected userNameStatus$: Observable<string>;
  protected emailStatus$: Observable<string>;
  protected formFieldStatus$: Observable<string>;

  protected userSearchResults: User[] | undefined;

  constructor(private formBuilder: FormBuilder) {
    this.userForm = this.formBuilder.group({

      username: ["", [Validators.required, Validators.minLength(3)]],
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      emailAddress: ["", [Validators.required, Validators.email]],
      address: ["", Validators.required],
      phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],

      }
    )
    this.userNameStatus$ = this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(300),
      filter(value => value.length > 2),
      switchMap(value => this.userService.isNameTaken(value)),
      map(isTaken => (isTaken ? 'Name existiert bereits' : 'ok')),
      startWith('')
    );

    this.emailStatus$ = this.userForm.controls['emailAddress'].valueChanges.pipe(
      debounceTime(300),
      filter(value => value.includes('@')),
      switchMap(value => this.userService.isEmailTaken(value)),
      map(isTaken => (isTaken ? 'E-Mail existiert bereits' : 'ok')),
      startWith('')
    );

    // Formularstatus
    this.formFieldStatus$ = this.userForm.statusChanges.pipe(startWith(this.userForm.status));

  }



  ngOnInit(): void {
    this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(400),
      filter(value => value.length > 2),
      switchMap(value => this.userService.searchUsers(value)),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.userSearchResults = results;
    });
  }

  onSubmit() {


  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
