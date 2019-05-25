import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/shared/order.service';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { OrderItemsComponent } from '../order-items/order-items.component';
import { CustomerService } from 'src/app/shared/customer.service';
import { Customer } from 'src/app/shared/customer.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styles: []
})
export class OrderComponent implements OnInit {
  customerList : Customer[];
  isValid : boolean = true;

  constructor(private service: OrderService,
    private dialog: MatDialog,
    private customerService: CustomerService) { }

  ngOnInit() {
    this.resetForm();

    this.customerService.getCustomerList().then(res => this.customerList = res as Customer[]);
  }


  resetForm(form?: NgForm) {
    if (form = null)
      form.resetForm();
    this.service.formData = {
      OrderID: null,
      OrderNo: Math.floor(100000 + Math.random() * 900000).toString(),
      CustomerID: 0,
      PaymentMethod: '',
      GrandTotal: 0
    }
    this.service.orderItems = [];
  }

  AddOrEditItem(orderItemIndex, OrderID) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    dialogConfig.data = {orderItemIndex, OrderID};
    this.dialog.open(OrderItemsComponent, dialogConfig).afterClosed().subscribe(res => {
      this.updateGrandTotal();
    });
  }

  updateGrandTotal() {
    this.service.formData.GrandTotal = this.service.orderItems.reduce((prev, curr) => {
      return prev + curr.Total;
    }, 0);

    this.service.formData.GrandTotal = parseFloat(this.service.formData.GrandTotal.toFixed(2));
  }

  onDeleteOrderItem(orderItemID: number, i: number) {
    this.service.orderItems.splice(i, 1);
    this.updateGrandTotal();
  }

  validateForm() {
    this.isValid = true;
    if (this.service.formData.CustomerID == 0)
      this.isValid = false;
    else if (this.service.orderItems.length == 0)
      this.isValid = false;
    return this.isValid;
  }

  onSubmit(form: NgForm) {
    if (this.validateForm())
    {
      this.service.saveOrUpdateOrder().subscribe(res => {
        this.resetForm();
      })
    }
  }
}
