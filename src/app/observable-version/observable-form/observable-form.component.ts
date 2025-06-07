import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, debounceTime, filter, map, Observable, startWith, Subject, switchMap, takeUntil} from 'rxjs';
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
export class ObservableFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private userService = inject(UserService);

  protected userForm: FormGroup;

  protected users: Observable<User[]>;

  protected userNameStatus$: Observable<string>;
  protected emailStatus$: Observable<string>;
  protected formFieldStatus$: Observable<string>;

  protected isEmailAddressTaken$: Observable<boolean>;
  protected isUserNameTaken$: Observable<boolean>;
  protected canSubmit$: Observable<boolean>;

  protected userSearchResults: User[] | undefined;

  constructor(private formBuilder: FormBuilder) {
    this.users = this.userService.getUsers();

    this.userForm = this.formBuilder.group({
        username: ["", [Validators.required, Validators.minLength(3)]],
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        emailAddress: ["", [Validators.required, Validators.email]],
        address: ["", Validators.required],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );

    this.isUserNameTaken$ = this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(300),
      filter(value => value.length > 2),
      switchMap(value => this.isNameTaken(value)),
      startWith(false)
    );

    this.isEmailAddressTaken$ = this.userForm.controls['emailAddress'].valueChanges.pipe(
      debounceTime(300),
      filter(value => value.includes('@')),
      switchMap(value => this.isEmailTaken(value)),
      startWith(false)
    );

    this.formFieldStatus$ = this.userForm.statusChanges.pipe(
      startWith(this.userForm.status)
    );

    this.userNameStatus$ = this.isUserNameTaken$.pipe(
      map(isTaken => isTaken ? 'Name existiert bereits' : 'ok')
    );

    this.emailStatus$ = this.isEmailAddressTaken$.pipe(
      map(isTaken => isTaken ? 'Email existiert bereits' : 'ok')
    );

    this.canSubmit$ = combineLatest([
      this.formFieldStatus$,
      this.isUserNameTaken$,
      this.isEmailAddressTaken$
    ]).pipe(
      map(([formStatus, isUserNameTaken, isEmailTaken]) =>
        formStatus === 'VALID' && !isUserNameTaken && !isEmailTaken
      )
    );
  };

  ngOnInit(): void {
    this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(400),
      filter(value => value.length > 2),
      switchMap(value => this.searchUsers(value)),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.userSearchResults = results;
    });
  };

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.addUser(this.userForm)
    } else {
      alert('Bitte alle Felder korrekt ausfüllen.');
    }
  };

  isNameTaken(name: string) {
    return this.users.pipe(
      map(users =>
        users.some(user => user.userName.toLowerCase() === name.toLowerCase())
      )
    );
  };

  isEmailTaken(address: string) {
    return this.users.pipe(
      map(users =>
        users.some(user => user.eMailAddress.toLowerCase() === address.toLowerCase())
      )
    );
  };

  searchUsers(name: string): Observable<User[]> {
    return this.users.pipe(
      map(users => users.filter(user =>
        user.userName.toLowerCase().includes(name.toLowerCase())
      ))
    );
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  };
}
