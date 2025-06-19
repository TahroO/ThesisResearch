import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, debounceTime, filter, map, Observable, startWith, Subject, switchMap, takeUntil} from 'rxjs'; // external dep 9x
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
export class ObservableFormComponent implements OnInit, OnDestroy { // interface 2x
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
    this.users = this.userService.getUsers(); // logicStep
    // initialize form fields
    this.userForm = this.formBuilder.group({ // logicStep
        username: ["", [Validators.required, Validators.minLength(3)]],
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        emailAddress: ["", [Validators.required, Validators.email]],
        address: ["", Validators.required],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );
  };

  ngOnInit(): void { // life cycle hook
    // reactive field evaluation of user input
    this.isUserNameTaken$ = this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(300), // operator
      filter(value => value.length > 2), // logicStep // operator
      switchMap(value => this.isNameTaken(value)), // logicStep // operator
      startWith(false) // operator
    );
    this.isEmailAddressTaken$ = this.userForm.controls['emailAddress'].valueChanges.pipe(
      debounceTime(300), // operator
      filter(value => value.includes('@')), // logicStep // operator
      switchMap(value => this.isEmailTaken(value)), // logicStep // operator
      startWith(false) // operator
    );
    this.formFieldStatus$ = this.userForm.statusChanges.pipe(
      startWith(this.userForm.status) // operator
    );

    // reactive visual user feedback according to state
    this.userNameStatus$ = this.isUserNameTaken$.pipe(
      map(isTaken => isTaken ? 'Name existiert bereits' : 'ok') // logicStep // operator
    );
    this.emailStatus$ = this.isEmailAddressTaken$.pipe(
      map(isTaken => isTaken ? 'Email existiert bereits' : 'ok') // logicStep // operator
    );
    // search results observable version
    this.userForm.controls['username'].valueChanges.pipe(
      debounceTime(400), // operator
      filter(value => value.length > 2), // logicStep // operator
      switchMap(value => this.searchUsers(value)), // logicStep // operator
      takeUntil(this.destroy$) // operator
    ).subscribe(results => { // subscription
      this.userSearchResults = results; // logicStep
    });

    // reactive button state evaluation
    this.canSubmit$ = combineLatest([ // operator
      this.formFieldStatus$,
      this.isUserNameTaken$,
      this.isEmailAddressTaken$
    ]).pipe(
      map(([formStatus, isUserNameTaken, isEmailTaken]) => { // operator
        this.countCanSubmitEvaluation();
          return formStatus === 'VALID' && !isUserNameTaken && !isEmailTaken // logicStep
        }
      )
    );
  };

  // button event execution
  protected onSubmit() {
    if (this.userForm.valid) { // logicStep
      this.userService.addUser(this.userForm) // logicStep
    } else {
      alert('Bitte alle Felder korrekt ausfüllen.'); // logicStep
    }
  };

  // helper methods for evaluation
  protected isNameTaken(name: string) {
    return this.users.pipe(
      map(users => // operator
        users.some(user => user.userName.toLowerCase() === name.toLowerCase()) // logicStep
      )
    );
  };
  protected isEmailTaken(address: string) {
    return this.users.pipe(
      map(users => // operator
        users.some(user => user.eMailAddress.toLowerCase() === address.toLowerCase()) // logicStep
      )
    );
  };
  protected searchUsers(name: string): Observable<User[]> {
    return this.users.pipe(
      map(users => users.filter(user => // operator // logicStep
        user.userName.toLowerCase().includes(name.toLowerCase()) // logicStep
      ))
    );
  };

  // cleanup - prevent memory leaks - after component is destroyed
  ngOnDestroy(): void { // life cycle hook
    this.destroy$.next(); // logicStep
    this.destroy$.complete(); // logicStep
  };

  // triggers counter when canSubmit is reevaluated - only for evaluation
  protected countCanSubmitEvaluation() {
    this.counter++;
    console.log(`canSubmit$ Observable evaluation used ` + this.counter + ' times');
  }
}
