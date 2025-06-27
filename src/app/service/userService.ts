import {User} from '../model/user';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  protected users: Observable<User[]>;
  constructor(private http: HttpClient) {
    this.users = this.http.get<User[]>('assets/data/users.json')
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('assets/data/users.json');
  }

  addUser(userForm: FormGroup) {
    alert('User ' + userForm.get('username')?.value + ' would have been added! (No POST available)');
    const rand = Math.floor(Math.random() * 100) + 1;
    const newUser: User = {
      id: rand,
      userName: userForm.get('username')?.value,
      firstName: userForm.get('firstName')?.value,
      lastName: userForm.get('lastName')?.value,
      phoneNumber: userForm.get('phoneNumber')?.value,
      address: userForm.get('address')?.value,
      eMailAddress: userForm.get('emailAddress')?.value,
    }
    return this.http.put<User>('/data/users.json', newUser);
  }
}
