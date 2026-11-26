define i64 @add_shift_variable(i64 %a, i64 %b, i64 %amount) {
entry:
  %shifted = shl i64 %b, %amount
  %sum = add i64 %a, %shifted
  ret i64 %sum
}
