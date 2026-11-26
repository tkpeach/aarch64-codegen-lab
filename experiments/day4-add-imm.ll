define i64 @plus_4095(i64 %x) {
  %sum = add i64 %x, 4095
  ret i64 %sum
}

define i64 @plus_4096(i64 %x) {
  %sum = add i64 %x, 4096
  ret i64 %sum
}

define i64 @plus_4097(i64 %x) {
  %sum = add i64 %x, 4097
  ret i64 %sum
}
