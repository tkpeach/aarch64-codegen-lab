define i32 @small_word(i32 %x) {
  %r = add i32 %x, 4096
  ret i32 %r
}

define i32 @neighbor_word(i32 %x) {
  %r = add i32 %x, 4097
  ret i32 %r
}
