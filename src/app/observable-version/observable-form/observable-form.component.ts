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
/**
 * Represents an observable version of a reactive registration form with extended validation
 */
export class ObservableFormComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private destroy$ = new Subject<void>();
  protected userForm: FormGroup;
  // existing collection of users
  protected users: Observable<User[]>;
  // reactive form state handling
  protected userNameStatus$: Observable<string> | undefined;
  protected emailStatus$: Observable<string> | undefined;
  protected formFieldStatus$: Observable<string> | undefined;
  // evaluation methods
  protected isEmailAddressTaken$: Observable<boolean> | undefined;
  protected isUserNameTaken$: Observable<boolean> | undefined;
  protected canSubmit$: Observable<boolean> | undefined;
  // direct user feedback on duplicated usernames
  protected userSearchResults: User[] | undefined;
  // evaluation counter
  protected counter: number = 0;

  constructor(private formBuilder: FormBuilder) {
    // initialize user collection via http-request - lazy observable
    this.users = this.userService.getUsers();
    // initialize form fields
    this.userForm = this.formBuilder.group({
        username: ["", [Validators.required, Validators.minLength(3)]],
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        emailAddress: ["", [Validators.required, Validators.email]],
        address: ["", Validators.required],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );
  };

  ngOnInit(): void {
    // reactive field evaluation of user input
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

    // reactive visual user feedback according to state
    this.userNameStatus$ = this.isUserNameTaken$.pipe(
      map(isTaken => isTaken ? 'Name existiert bereits' : 'ok')
    );
    this.emailStatus$ = this.isEmailAddressTaken$.pipe(
      map(isTaken => isTaken ? 'Email existiert bereits' : 'ok')
    );
    // search results observable version
    this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(400),
      filter(value => value.length > 2),
      switchMap(value => this.searchUsers(value)),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.userSearchResults = results;
    });

    // reactive button state evaluation
    this.canSubmit$ = combineLatest([
      this.formFieldStatus$,
      this.isUserNameTaken$,
      this.isEmailAddressTaken$
    ]).pipe(
      map(([formStatus, isUserNameTaken, isEmailTaken]) => {
        this.countCanSubmitEvaluation();
          return formStatus === 'VALID' && !isUserNameTaken && !isEmailTaken
        }
      )
    );
  };

  // button event execution
  protected onSubmit() {
    if (this.userForm.valid) {
      this.userService.addUser(this.userForm)
    } else {
      alert('Bitte alle Felder korrekt ausfüllen.');
    }
  };

  // helper methods for evaluation
  protected isNameTaken(name: string) {
    return this.users.pipe(
      map(users =>
        users.some(user => user.userName.toLowerCase() === name.toLowerCase())
      )
    );
  };
  protected isEmailTaken(address: string) {
    return this.users.pipe(
      map(users =>
        users.some(user => user.eMailAddress.toLowerCase() === address.toLowerCase())
      )
    );
  };
  protected searchUsers(name: string): Observable<User[]> {
    return this.users.pipe(
      map(users => users.filter(user =>
        user.userName.toLowerCase().includes(name.toLowerCase())
      ))
    );
  };

  // cleanup - prevent memory leaks - after component is destroyed
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  };

  // triggers counter when canSubmit is reevaluated - only for evaluation
  protected countCanSubmitEvaluation() {
    this.counter++;
    console.log(`canSubmit$ Observable evaluation used ` + this.counter + ' times');
  }
}
